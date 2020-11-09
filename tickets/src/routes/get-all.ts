import { NotFoundError } from "@craterspace/common";
import express, { Request, Response } from "express";
import { TicketModel } from "../models/ticket-model";

const router = express.Router();

router.get("/api/tickets", async (req: Request, res: Response) => {
  const tickets = await TicketModel.find({});
  if (!tickets) throw new NotFoundError();
  res.send(tickets);
});

export { router as getTicketsRouter };
