import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@craterspace/common";
import { natsClient } from "../events/nats-client";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { OrderModel } from "../models/order-model";
import { PaymentModel } from "../models/payment-model";
import { stripe } from "../stripe";

// * Router
const router = express.Router();

// Request body validator
const bodyValidator = [
  body("token").not().isEmpty().withMessage("Token is required"),
  body("orderId").not().isEmpty().withMessage("OrderId is required"),
];

// POST request to create a charge
router.post(
  "/api/payments",
  requireAuth,
  bodyValidator,
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    // find the order that is being paid for
    const order = await OrderModel.findById(orderId);

    if (!order) throw new NotFoundError();
    if (order.userId !== req.currentUser!.id) throw new NotAuthorizedError();
    if (order.status === OrderStatus.Cancelled)
      throw new BadRequestError("Cannot pay for a cancelled order");

    // Charge the users credit card with the stripe sdk library
    const stripeResponse = await stripe.charges.create({
      amount: order.price * 100, //Convert the dollar amount to cents
      currency: "usd",
      source: token,
    });

    // Create a payment document in the database
    const payment = PaymentModel.build({
      orderId: order.id,
      chargeId: stripeResponse.id,
    });
    await payment.save();

    // Publish the payment created event
    new PaymentCreatedPublisher(natsClient.instance).publish({
      id: payment.id,
      orderId: order.id,
      stripeId: stripeResponse.id,
    });

    res.status(201).send({ id: payment.id });
  }
);

export { router as newChargeRouter };
