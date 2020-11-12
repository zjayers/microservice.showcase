import {
  EventListener,
  IOrderCancelledEvent,
  NotFoundError,
  Subjects,
} from "@craterspace/common";
import { Message } from "node-nats-streaming";
import { TicketModel } from "../../models/ticket-model";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { QUEUE_GROUP_NAME } from "../queue-group-name";

export class OrderCancelledListener extends EventListener<
  IOrderCancelledEvent
> {
  queueGroupName: string = QUEUE_GROUP_NAME;
  subject: IOrderCancelledEvent["subject"] = Subjects.OrderCancelled;

  async onMessage(data: IOrderCancelledEvent["data"], msg: Message) {
    // Find the ticket in the database
    const ticket = await TicketModel.findById(data.ticket.id);

    // Check if the ticket exists
    if (!ticket) {
      throw new NotFoundError();
    }

    // Set the tickets orderId to undefined
    ticket.set({ orderId: undefined });

    // Save the ticket
    await ticket.save();

    // Because a change was made to the ticket, a 'ticket:updated' event
    // must be emitted to allow the orders-service to stay in sync with
    // versioning
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version,
    });

    // Ack the msg
    msg.ack();
  }
}
