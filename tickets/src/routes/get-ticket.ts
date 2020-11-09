import { NotFoundError } from "@craterspace/common";
import express, { Request, Response } from "express";
import { TicketModel } from "../models/ticket-model";

const router = express.Router();

router.get("/api/tickets/:id", async (req: Request, res: Response) => {
  const id = req.params.id;

  const ticket = await TicketModel.findById(id);

  if (!ticket) throw new NotFoundError();

  res.send(ticket);
});

export { router as getTicketRouter };
