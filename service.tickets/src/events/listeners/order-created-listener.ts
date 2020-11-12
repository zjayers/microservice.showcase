import {
  EventListener,
  IOrderCreatedEvent,
  NotFoundError,
  Subjects,
} from "@craterspace/common";
import { Message } from "node-nats-streaming";
import { TicketModel } from "../../models/ticket-model";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { QUEUE_GROUP_NAME } from "../queue-group-name";

export class OrderCreatedListener extends EventListener<IOrderCreatedEvent> {
  queueGroupName: string = QUEUE_GROUP_NAME;
  subject: IOrderCreatedEvent["subject"] = Subjects.OrderCreated;

  async onMessage(data: IOrderCreatedEvent["data"], msg: Message) {
    // Find the ticket that the order is reserving
    const ticket = await TicketModel.findById(data.ticket.id);

    // If no ticket exists, throw an error
    if (!ticket) {
      throw new NotFoundError();
    }

    // Mark the ticket as being reserved by setting its orderID property
    ticket.set({ orderId: data.id });

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

    // Ack the message
    msg.ack();
  }
}
