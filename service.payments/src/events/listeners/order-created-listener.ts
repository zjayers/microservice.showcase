import {
  EventListener,
  IOrderCreatedEvent,
  Subjects,
} from "@craterspace/common";
import { Message } from "node-nats-streaming";
import { OrderModel } from "../../models/order-model";
import { QUEUE_GROUP_NAME } from "../queue-group-name";

export class OrderCreatedListener extends EventListener<IOrderCreatedEvent> {
  readonly queueGroupName: string = QUEUE_GROUP_NAME;
  readonly subject: IOrderCreatedEvent["subject"] = Subjects.OrderCreated;

  async onMessage(data: IOrderCreatedEvent["data"], msg: Message) {
    const order = await OrderModel.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version,
    });
    await order.save();

    msg.ack();
  }
}
