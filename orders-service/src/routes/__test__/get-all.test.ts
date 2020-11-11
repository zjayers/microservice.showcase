import supertest from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { ITicketDoc, TicketModel } from "../../models/ticket-model";

const { ordersRoute, signUp, validTicketTitle, validTicketPrice } = global;

const createOneOrder = async (cookie: string[], ticket: ITicketDoc) => {
  return supertest(app)
    .post(ordersRoute)
    .set("Cookie", cookie)
    .send({ ticketId: ticket.id })
    .expect(201);
};

const createOneTicket = async () => {
  const ticket = TicketModel.build({
    title: validTicketTitle,
    price: validTicketPrice,
  });

  await ticket.save();

  return ticket;
};

describe("Get All Orders", () => {
  it("should fetch a list of orders", async () => {
    const ticket1 = await createOneTicket();
    const ticket2 = await createOneTicket();
    const ticket3 = await createOneTicket();

    const user1Cookie = signUp();
    const user2Cookie = signUp();

    const { body: order1 } = await createOneOrder(user1Cookie, ticket1);
    const { body: order2 } = await createOneOrder(user2Cookie, ticket2);
    const { body: order3 } = await createOneOrder(user2Cookie, ticket3);

    const { body: user1Response } = await supertest(app)
      .get(ordersRoute)
      .set("Cookie", user1Cookie)
      .send()
      .expect(200);

    const { body: user2Response } = await supertest(app)
      .get(ordersRoute)
      .set("Cookie", user2Cookie)
      .send()
      .expect(200);

    expect(user1Response.length).toEqual(1);
    expect(user1Response[0].id).toEqual(order1.id);
    expect(user1Response[0].ticket.id).toEqual(ticket1.id);

    expect(user2Response.length).toEqual(2);
    expect(user2Response[0].id).toEqual(order2.id);
    expect(user2Response[0].ticket.id).toEqual(ticket2.id);
    expect(user2Response[1].id).toEqual(order3.id);
    expect(user2Response[1].ticket.id).toEqual(ticket3.id);
  });
});
