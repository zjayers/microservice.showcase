import {
  EventListener,
  ITicketUpdatedEvent,
  Subjects,
} from "@craterspace/common";
import { Message } from "node-nats-streaming";
import { TicketModel } from "../../models/ticket-model";
import { QUEUE_GROUP_NAME } from "../queue-group-name";

export class TicketUpdatedListener extends EventListener<ITicketUpdatedEvent> {
  readonly queueGroupName = QUEUE_GROUP_NAME;
  readonly subject = Subjects.TicketUpdated;

  async onMessage(
    data: ITicketUpdatedEvent["data"],
    msg: Message
  ): Promise<void> {
    const ticket = await TicketModel.findByIdAndPrevVersion(data);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // If using a custom version checker, pass in the new version from the data
    // const { title, price, version } = data;
    // ticket.set({ title, price, version });

    const { title, price } = data;
    ticket.set({ title, price });

    await ticket.save();

    msg.ack();
  }
}
