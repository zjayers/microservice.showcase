import supertest, { Response } from "supertest";
import { app } from "../../app";
import { natsClient } from "../../events/nats-client";
import { TicketModel } from "../../models/ticket-model";

const {
  ticketsRoute,
  signUp,
  validTicketPrice,
  validTicketTitle,
  invalidTicketPrice,
  invalidTicketTitle,
} = global;

describe("New Ticket Route Handler", () => {
  it("should have a route handler listening to /api/tickets for post requests", async () => {
    const response: Response = await supertest(app).post(ticketsRoute).send({});

    expect(response.status).not.toEqual(404);
  });

  it("should only be accessibly if the user is signed in", async () => {
    await supertest(app).post(ticketsRoute).send({}).expect(401);
  });

  it("should return a status other than 401 if the user is signed in", async () => {
    const response: Response = await supertest(app)
      .post(ticketsRoute)
      .set("Cookie", signUp())
      .send({});

    expect(response.status).not.toEqual(401);
  });

  it("should return an error if an invalid title is provided", async () => {
    await supertest(app)
      .post(ticketsRoute)
      .set("Cookie", signUp())
      .send({ title: invalidTicketTitle, price: validTicketPrice })
      .expect(400);

    await supertest(app)
      .post(ticketsRoute)
      .set("Cookie", signUp())
      .send({ price: validTicketPrice })
      .expect(400);
  });

  it("should return an error if an invalid price is provided", async () => {
    await supertest(app)
      .post(ticketsRoute)
      .set("Cookie", signUp())
      .send({ title: validTicketTitle, price: invalidTicketPrice })
      .expect(400);

    await supertest(app)
      .post(ticketsRoute)
      .set("Cookie", signUp())
      .send({ title: validTicketTitle })
      .expect(400);
  });

  it("should create a ticket if inputs are valid", async () => {
    let docs = await TicketModel.find({});
    expect(docs.length).toEqual(0);

    await supertest(app)
      .post(ticketsRoute)
      .set("Cookie", signUp())
      .send({ title: validTicketTitle, price: validTicketPrice })
      .expect(201);

    docs = await TicketModel.find({});
    expect(docs.length).toEqual(1);
    expect(docs[0].title).toEqual(validTicketTitle);
    expect(docs[0].price).toEqual(validTicketPrice);
  });

  it("should publish an event to the NATS server", async () => {
    await supertest(app)
      .post(ticketsRoute)
      .set("Cookie", signUp())
      .send({ title: validTicketTitle, price: validTicketPrice })
      .expect(201);

    expect(natsClient.instance.publish).toHaveBeenCalled();
  });
});
