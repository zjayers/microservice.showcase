// * Imports
import {
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@craterspace/common";
import express, { Request, Response } from "express";
import { param } from "express-validator";
import { natsClient } from "../events/nats-client";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { OrderModel } from "../models/order-model";

// * Router
const router = express.Router();

const paramValidator = [
  param("orderId")
    .not()
    .isEmpty()
    .withMessage("OrderId is required")
    .isMongoId()
    .withMessage("OrderId is invalid"),
];

// Patch a single ticket
router.patch(
  "/api/orders/:orderId",
  requireAuth,
  paramValidator,
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await OrderModel.findById(orderId).populate("ticket");

    if (!order) throw new NotFoundError();

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    new OrderCancelledPublisher(natsClient.instance).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(200).send(order);
  }
);

export { router as cancelOrderRouter };
