import supertest from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsClient } from "../../events/nats-client";

const {
  ticketsRoute,
  signUp,
  validTicketTitle,
  validTicketPrice,
  invalidTicketTitle,
  invalidTicketPrice,
  updatedTicketTitle,
  updatedTicketPrice,
} = global;

it("should return a 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await supertest(app)
    .put(`${ticketsRoute}/${id}`)
    .set("Cookie", signUp())
    .send({
      title: validTicketTitle,
      price: validTicketPrice,
    })
    .expect(404);
});

it("should return a 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await supertest(app)
    .put(`${ticketsRoute}/${id}`)
    .send({
      title: validTicketTitle,
      price: validTicketPrice,
    })
    .expect(401);
});

it("should return a 401 if the user does not own the ticket", async () => {
  const response = await supertest(app)
    .post(ticketsRoute)
    .set("Cookie", signUp())
    .send({
      title: validTicketTitle,
      price: validTicketPrice,
    });

  await supertest(app)
    .put(`${ticketsRoute}/${response.body.id}`)
    .set("Cookie", signUp())
    .send({
      title: updatedTicketTitle,
      price: updatedTicketPrice,
    })
    .expect(401);
});

it("should return a 400 if the user provides an invalid title or price", async () => {
  const cookie = signUp();

  const response = await supertest(app)
    .post(ticketsRoute)
    .set("Cookie", cookie)
    .send({
      title: validTicketTitle,
      price: validTicketPrice,
    });

  await supertest(app)
    .put(`${ticketsRoute}/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: invalidTicketTitle,
      price: validTicketPrice,
    })
    .expect(400);

  await supertest(app)
    .put(`${ticketsRoute}/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: validTicketTitle,
      price: invalidTicketPrice,
    })
    .expect(400);
});

it("should update the ticket if valid inputs are provided", async () => {
  const cookie = signUp();

  const response = await supertest(app)
    .post(ticketsRoute)
    .set("Cookie", cookie)
    .send({
      title: validTicketTitle,
      price: validTicketPrice,
    });

  await supertest(app)
    .put(`${ticketsRoute}/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: updatedTicketTitle,
      price: updatedTicketPrice,
    })
    .expect(200);

  const ticketResponse = await supertest(app)
    .get(`${ticketsRoute}/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual(updatedTicketTitle);
  expect(ticketResponse.body.price).toEqual(updatedTicketPrice);
});

it("should publish an event to the NATS server", async () => {
  const cookie = signUp();

  const response = await supertest(app)
    .post(ticketsRoute)
    .set("Cookie", cookie)
    .send({
      title: validTicketTitle,
      price: validTicketPrice,
    });

  await supertest(app)
    .put(`${ticketsRoute}/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: updatedTicketTitle,
      price: updatedTicketPrice,
    })
    .expect(200);

  expect(natsClient.instance.publish).toHaveBeenCalled();
});
