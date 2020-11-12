import {
  EventListener,
  IOrderCancelledEvent,
  NotFoundError,
  OrderStatus,
  Subjects,
} from "@craterspace/common";
import { Message } from "node-nats-streaming";
import { OrderModel } from "../../models/order-model";
import { QUEUE_GROUP_NAME } from "../queue-group-name";

export class OrderCancelledListener extends EventListener<
  IOrderCancelledEvent
> {
  readonly queueGroupName: string = QUEUE_GROUP_NAME;
  readonly subject: IOrderCancelledEvent["subject"] = Subjects.OrderCancelled;

  async onMessage(data: IOrderCancelledEvent["data"], msg: Message) {
    const order = await OrderModel.findByIdAndPrevVersion(data);

    if (!order) throw new NotFoundError();

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    msg.ack();
  }
}
