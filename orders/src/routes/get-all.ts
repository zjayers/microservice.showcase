// * Imports
import { NotFoundError } from "@craterspace/common";
import express, { Request, Response } from "express";
import { OrderModel } from "../models/order-model";

// * Router
const router = express.Router();

// GET all tickets
router.get("/api/orders", async (req: Request, res: Response) => {
  const orders = await OrderModel.find({
    userId: req.currentUser!.id,
  }).populate("ticket");

  if (!orders) throw new NotFoundError();

  res.send(orders);
});

// * Exports
export { router as getOrdersRouter };
