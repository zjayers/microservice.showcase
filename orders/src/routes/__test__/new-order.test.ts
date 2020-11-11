import { OrderStatus } from "@craterspace/common";
import mongoose from "mongoose";
import supertest, { Response } from "supertest";
import { app } from "../../app";
import { natsClient } from "../../events/nats-client";
import { IOrderDoc, OrderModel } from "../../models/order-model";
import { TicketModel } from "../../models/ticket-model";

const {
  ordersRoute,
  signUp,
  validTicketPrice,
  validTicketTitle,
  invalidTicketPrice,
  invalidTicketTitle,
} = global;

describe("New Order Route Handler", () => {
  it("should have a route handler listening to /api/orders for post requests", async () => {
    const response: Response = await supertest(app).post(ordersRoute).send({});
    expect(response.status).not.toEqual(404);
  });

  it("should only be accessibly if the user is signed in", async () => {
    await supertest(app).post(ordersRoute).send({}).expect(401);
  });

  it("should return a status other than 401 if the user is signed in", async () => {
    const response: Response = await supertest(app)
      .post(ordersRoute)
      .set("Cookie", signUp())
      .send({});

    expect(response.status).not.toEqual(401);
  });

  it("should return an error no ticketId is passed in", async () => {
    await supertest(app)
      .post(ordersRoute)
      .set("Cookie", signUp())
      .send({})
      .expect(400);
  });

  it("should return an error if the ordered ticket does not exist", async () => {
    const ticketId = mongoose.Types.ObjectId();
    await supertest(app)
      .post(ordersRoute)
      .set("Cookie", signUp())
      .send({ ticketId })
      .expect(404);
  });

  it("should return an error if the ticket is already reserved", async () => {
    const ticket = TicketModel.build({
      title: validTicketTitle,
      price: validTicketPrice,
    });

    await ticket.save();

    const order = OrderModel.build({
      ticket,
      userId: "abcd1234",
      status: OrderStatus.Created,
      expiresAt: new Date(),
    });

    await order.save();

    await supertest(app)
      .post(ordersRoute)
      .set("Cookie", signUp())
      .send({ ticketId: ticket.id })
      .expect(400);
  });

  it("should create an order if inputs are valid", async () => {
    const ticket = TicketModel.build({
      title: validTicketTitle,
      price: validTicketPrice,
    });

    await ticket.save();

    const response: Response = await supertest(app)
      .post(ordersRoute)
      .set("Cookie", signUp())
      .send({ ticketId: ticket.id })
      .expect(201);

    const order = response.body as IOrderDoc;

    const docs = await OrderModel.find({});
    expect(docs.length).toEqual(1);
    expect(order.status).toEqual(OrderStatus.Created);
    expect(order.ticket.title).toEqual(validTicketTitle);
    expect(order.ticket.price).toEqual(validTicketPrice);
  });

  it("should publish an event to the NATS server", async () => {
    const ticket = TicketModel.build({
      title: validTicketTitle,
      price: validTicketPrice,
    });

    await ticket.save();

    await supertest(app)
      .post(ordersRoute)
      .set("Cookie", signUp())
      .send({ ticketId: ticket.id })
      .expect(201);

    expect(natsClient.instance.publish).toHaveBeenCalled();
  });
});
