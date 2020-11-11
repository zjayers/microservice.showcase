import supertest from "supertest";
import { app } from "../../app";

const { ticketsRoute, signUp, validTicketTitle, validTicketPrice } = global;

const createOneTicket = () =>
  supertest(app)
    .post(ticketsRoute)
    .set("Cookie", signUp())
    .send({ title: validTicketTitle, price: validTicketPrice })
    .expect(201);

describe("Get All Tickets", () => {
  it("should fetch a list of tickets", async () => {
    await createOneTicket();
    await createOneTicket();
    await createOneTicket();

    const response = await supertest(app).get(ticketsRoute).send().expect(200);
    expect(response.body.length).toEqual(3);
  });
});
