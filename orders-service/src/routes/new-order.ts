// * Imports
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@craterspace/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { natsClient } from "../events/nats-client";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { OrderModel } from "../models/order-model";
import { TicketModel } from "../models/ticket-model";

// * Router
const router = express.Router();
const EXPIRATION_WINDOW_MINUTES = 15;

// POST - body validator
const bodyValidator = [
  body("ticketId")
    .not()
    .isEmpty()
    .withMessage("TicketId is required")
    .isMongoId()
    .withMessage("TicketId is invalid"),
];

// POST - create a single ticket
router.post(
  "/api/orders",
  requireAuth,
  bodyValidator,
  validateRequest,
  async (req: Request, res: Response) => {
    // Find the ticket the user is trying to order in the database
    const { ticketId } = req.body;
    const ticket = await TicketModel.findById(ticketId);

    if (!ticket) {
      throw new NotFoundError();
    }

    // Make sure the ticket is not already reserved
    const isReserved = await ticket.isReserved();

    if (isReserved) {
      // Ticket is already reserved
      throw new BadRequestError(
        "The ticket has already been reserved by another order."
      );
    }

    // Calculate an expiration date for the order
    const expiration = new Date(); // Right now in time
    expiration.setMinutes(expiration.getMinutes() + EXPIRATION_WINDOW_MINUTES);

    // Build the order and save it to the database
    const order = OrderModel.build({
      userId: req.currentUser!.id,
      expiresAt: expiration,
      status: OrderStatus.Created,
      ticket: ticket,
    });

    await order.save();

    // Publish an event to notify other services that an order was created
    await new OrderCreatedPublisher(natsClient.instance).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  }
);

// * Exports
export { router as createOrderRouter };
