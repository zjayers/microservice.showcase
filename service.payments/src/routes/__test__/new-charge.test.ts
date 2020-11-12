import { OrderStatus } from "@craterspace/common";
import mongoose from "mongoose";
import supertest from "supertest";
import { app } from "../../app";
import { OrderModel } from "../../models/order-model";
import { PaymentModel } from "../../models/payment-model";
import { stripe } from "../../stripe";

const {
  paymentsRoute,
  signUp,
  validTicketPrice,
  validTicketTitle,
  invalidTicketPrice,
  invalidTicketTitle,
} = global;

describe("New Charge Router", function () {
  it(
    "should throw a not found error if trying to purchase an order that does" +
      " not exist",
    async () => {
      await supertest(app)
        .post(paymentsRoute)
        .set("Cookie", signUp())
        .send({
          token: "abcd1234",
          orderId: mongoose.Types.ObjectId().toHexString(),
        })
        .expect(404);
    }
  );

  it(
    "should throw an unauthorized error if a different user attempts to pay" +
      " for an order that is already reserved by another user",
    async () => {
      const order = OrderModel.build({
        id: mongoose.Types.ObjectId().toHexString(),
        price: validTicketPrice,
        status: OrderStatus.Created,
        userId: mongoose.Types.ObjectId().toHexString(),
        version: 0,
      });
      await order.save();

      await supertest(app)
        .post(paymentsRoute)
        .set("Cookie", signUp())
        .send({
          token: "abcd1234",
          orderId: order.id,
        })
        .expect(401);
    }
  );

  it("should return a bad request error when purchasing a cancelled order", async () => {
    const userId = mongoose.Types.ObjectId();

    const order = OrderModel.build({
      id: mongoose.Types.ObjectId().toHexString(),
      price: validTicketPrice,
      status: OrderStatus.Cancelled,
      userId: userId.toHexString(),
      version: 0,
    });
    await order.save();

    await supertest(app)
      .post(paymentsRoute)
      .set("Cookie", signUp(userId))
      .send({
        token: "abcd1234",
        orderId: order.id,
      })
      .expect(400);
  });

  it("should return a 201 with valid inputs", async () => {
    const userId = mongoose.Types.ObjectId();
    const price = Math.floor(Math.random() * 100000);

    const order = OrderModel.build({
      id: mongoose.Types.ObjectId().toHexString(),
      price: price,
      status: OrderStatus.Created,
      userId: userId.toHexString(),
      version: 0,
    });
    await order.save();

    await supertest(app)
      .post(paymentsRoute)
      .set("Cookie", signUp(userId))
      .send({
        token: "tok_visa",
        orderId: order.id,
      })
      .expect(201);

    const stripeCharges = await stripe.charges.list({ limit: 50 });
    const stripeCharge = stripeCharges.data.find(
      (charge) => charge.amount === price * 100
    );

    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.currency).toEqual("usd");

    const payment = await PaymentModel.findOne({
      orderId: order.id,
      chargeId: stripeCharge!.id,
    });

    expect(payment).not.toBeNull();
  });
});
