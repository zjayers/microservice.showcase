// * Imports
import { requireAuth, validateRequest } from "@craterspace/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { natsClient } from "../events/nats-client";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
import { TicketModel } from "../models/ticket-model";

// * Router
const router = express.Router();

// POST - body validator
const ticketBodyValidator = [
  body("title").not().isEmpty().withMessage("Title is required"),
  body("price")
    .not()
    .isEmpty()
    .withMessage("Price is required")
    .isFloat({ gt: 0 })
    .withMessage("Price must be numeric and greater then 0"),
];

// POST - create a single ticket
router.post(
  "/api/tickets",
  requireAuth,
  ticketBodyValidator,
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const ticket = TicketModel.build({
      title,
      price,
      userId: req.currentUser!.id,
    });

    await ticket.save();

    // Publish event to NATS
    await new TicketCreatedPublisher(natsClient.instance).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.status(201).send(ticket);
  }
);

// * Exports
export { router as createTicketRouter };
