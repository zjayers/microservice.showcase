// * Imports
import { NotAuthorizedError, NotFoundError } from "@craterspace/common";
import express, { Request, Response } from "express";
import { body, param } from "express-validator";
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

// GET a single ticket
router.get(
  "/api/orders/:orderId",
  paramValidator,
  async (req: Request, res: Response) => {
    const orderId = req.params.orderId;

    const order = await OrderModel.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    res.send(order);
  }
);

export { router as getOrderRouter };
