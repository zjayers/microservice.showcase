// * Imports
import { NotFoundError } from "@craterspace/common";
import express, { Request, Response } from "express";
import { TicketModel } from "../models/ticket-model";

// * Router
const router = express.Router();

// GET a single ticket
router.get("/api/tickets/:id", async (req: Request, res: Response) => {
  const id = req.params.id;

  const ticket = await TicketModel.findById(id);
  if (!ticket) throw new NotFoundError();

  res.send(ticket);
});

export { router as getTicketRouter };
