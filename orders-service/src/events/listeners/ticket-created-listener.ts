import {
  EventListener,
  ITicketCreatedEvent,
  Subjects,
} from "@craterspace/common";
import { Message } from "node-nats-streaming";
import { TicketModel } from "../../models/ticket-model";
import { QUEUE_GROUP_NAME } from "../queue-group-name";

export class TicketCreatedListener extends EventListener<ITicketCreatedEvent> {
  readonly queueGroupName = QUEUE_GROUP_NAME;
  readonly subject = Subjects.TicketCreated;

  async onMessage(
    data: ITicketCreatedEvent["data"],
    msg: Message
  ): Promise<void> {
    const { id, title, price } = data;

    const ticket = TicketModel.build({
      id,
      title,
      price,
    });

    await ticket.save();
    msg.ack();
  }
}
