import mongoose from "mongoose";
import supertest, { Response } from "supertest";
import { app } from "../../app";

const { ticketsRoute, signUp, validTicketTitle, validTicketPrice } = global;

describe("Get One Ticket", () => {
  it("should return a status of 404 if the ticket is not found", async () => {
    const id = mongoose.Types.ObjectId().toHexString();

    await supertest(app)
      .get(ticketsRoute + "/" + id)
      .send({})
      .expect(404);
  });

  it("should return the ticket if the ticket is found", async () => {
    const response = await supertest(app)
      .post(ticketsRoute)
      .set("Cookie", signUp())
      .send({ title: validTicketTitle, price: validTicketPrice })
      .expect(201);

    const ticketResponse = await supertest(app)
      .get(ticketsRoute + "/" + response.body.id)
      .send({})
      .expect(200);

    expect(ticketResponse.body.title).toEqual(validTicketTitle);
    expect(ticketResponse.body.price).toEqual(validTicketPrice);
  });
});
