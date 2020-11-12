import { OrderStatus, TokenManager } from "@craterspace/common";
import mongoose from "mongoose";
import supertest, { Response } from "supertest";
import { app } from "../../app";
import { natsClient } from "../../events/nats-client";
import { OrderModel } from "../../models/order-model";
import { TicketModel } from "../../models/ticket-model";

const { ordersRoute, signUp, validTicketTitle, validTicketPrice } = global;

describe("Cancel Order Handler", () => {
  it("should return a status of 404 if the order is not found", async () => {
    const id = mongoose.Types.ObjectId();

    await supertest(app)
      .patch(ordersRoute + "/" + id)
      .set("Cookie", signUp())
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
        .patch(ordersRoute + "/" + response.body.id)
        .set("Cookie", user2Cookie)
        .send({})
        .expect(401);
    }
  );

  it("should mark an order as cancelled", async () => {
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

    const { body: cancelledOrder } = await supertest(app)
      .patch(ordersRoute + "/" + createdOrder.id)
      .set("Cookie", user1Cookie)
      .send({})
      .expect(200);

    const orderInDb = await OrderModel.findById(createdOrder.id);

    expect(createdOrder.status).toEqual(OrderStatus.Created);
    expect(cancelledOrder.status).toEqual(OrderStatus.Cancelled);
    expect(orderInDb!.status).toEqual(OrderStatus.Cancelled);
  });

  it("should publish an event to the NATS server", async () => {
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

    await supertest(app)
      .patch(ordersRoute + "/" + createdOrder.id)
      .set("Cookie", user1Cookie)
      .send({})
      .expect(200);

    expect(natsClient.instance.publish).toHaveBeenCalledTimes(2);
  });
});
