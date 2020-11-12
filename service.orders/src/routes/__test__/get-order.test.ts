import { OrderStatus } from "@craterspace/common";
import mongoose from "mongoose";
import supertest, { Response } from "supertest";
import { app } from "../../app";
import { TicketModel } from "../../models/ticket-model";

const { ordersRoute, signUp, validTicketTitle, validTicketPrice } = global;

describe("Get One Order", () => {
  it("should return a status of 404 if the order is not found", async () => {
    const id = mongoose.Types.ObjectId();

    await supertest(app)
      .get(ordersRoute + "/" + id)
      .send({})
      .expect(404);
  });

  it(
    "should return an unauthorized error if trying to fetch an order that" +
      " does not belong to a user",
    async () => {
      const user1Cookie = signUp();
      const user2Cookie = signUp();

      const ticket = TicketModel.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: validTicketTitle,
        price: validTicketPrice,
      });

      await ticket.save();

      const response = await supertest(app)
        .post(ordersRoute)
        .set("Cookie", user1Cookie)
        .send({ ticketId: ticket.id })
        .expect(201);

      await supertest(app)
        .get(ordersRoute + "/" + response.body.id)
        .set("Cookie", user2Cookie)
        .send({})
        .expect(401);
    }
  );

  it("should return the order if the order is found", async () => {
    const user1Cookie = signUp();

    const ticket = TicketModel.build({
      id: mongoose.Types.ObjectId().toHexString(),
      title: validTicketTitle,
      price: validTicketPrice,
    });

    await ticket.save();

    const { body: createdOrder } = await supertest(app)
      .post(ordersRoute)
      .set("Cookie", user1Cookie)
      .send({ ticketId: ticket.id })
      .expect(201);

    const { body: fetchedOrder } = await supertest(app)
      .get(ordersRoute + "/" + createdOrder.id)
      .set("Cookie", user1Cookie)
      .send({})
      .expect(200);

    expect(createdOrder.id).toEqual(fetchedOrder.id);
    expect(fetchedOrder.status).toEqual(OrderStatus.Created);
    expect(fetchedOrder.ticket).toEqual(ticket.id);
  });
});
