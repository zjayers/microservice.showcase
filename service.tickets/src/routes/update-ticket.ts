// * Imports
import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@craterspace/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { natsClient } from "../events/nats-client";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { TicketModel } from "../models/ticket-model";

// * Router
const router = express.Router();

// PUT body validator
const bodyValidator = [
  body("title").not().isEmpty().withMessage("Title is required"),
  body("price")
    .isFloat({ gt: 0 })
    .withMessage("Price must be provided and must be greater than 0"),
];

// PUT a single ticket
router.put(
  "/api/tickets/:id",
  requireAuth,
  bodyValidator,
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await TicketModel.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    // Determine if the ticket is currently locked (reserved)
    if (ticket.orderId) {
      throw new BadRequestError("Cannot edit a reserved ticket.");
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });
    await ticket.save();

    // Publish event to NATS
    new TicketUpdatedPublisher(natsClient.instance).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
