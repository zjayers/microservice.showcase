// * Imports
import { NotFoundError } from "@craterspace/common";
import express, { Request, Response } from "express";
import { TicketModel } from "../models/ticket-model";

// * Router
const router = express.Router();

// GET all tickets
router.get("/api/tickets", async (req: Request, res: Response) => {
  const tickets = await TicketModel.find({});
  if (!tickets) throw new NotFoundError();

  res.send(tickets.filter((ticket) => ticket.orderId === undefined));
});

// * Exports
export { router as getTicketsRouter };
