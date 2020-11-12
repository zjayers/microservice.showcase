import {
  EventListener,
  IOrderCreatedEvent,
  Subjects,
} from "@craterspace/common";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";
import { QUEUE_GROUP_NAME } from "../queue-group-name";

export class OrderCreatedListener extends EventListener<IOrderCreatedEvent> {
  readonly queueGroupName: string = QUEUE_GROUP_NAME;
  readonly subject: IOrderCreatedEvent["subject"] = Subjects.OrderCreated;

  async onMessage(
    data: IOrderCreatedEvent["data"],
    msg: Message
  ): Promise<void> {
    // Get milliseconds from the order expiry time
    const expiryDelay =
      new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log("Waiting...", expiryDelay);

    // Create a new job and queue it
    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay: expiryDelay,
      }
    );

    // Ack the message
    msg.ack();
  }
}
