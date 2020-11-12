import {
  EventListener,
  IPaymentCreatedEvent,
  NotFoundError,
  OrderStatus,
  Subjects,
} from "@craterspace/common";
import { Message } from "node-nats-streaming";
import { OrderModel } from "../../models/order-model";
import { QUEUE_GROUP_NAME } from "../queue-group-name";

export class PaymentCreatedListener extends EventListener<
  IPaymentCreatedEvent
> {
  queueGroupName: string = QUEUE_GROUP_NAME;
  subject: IPaymentCreatedEvent["subject"] = Subjects.PaymentCreated;

  async onMessage(data: IPaymentCreatedEvent["data"], msg: Message) {
    const order = await OrderModel.findById(data.orderId);

    if (!order) throw new NotFoundError();

    order.set({ status: OrderStatus.Complete });
    await order.save();

    // If application is extended, or orders need to be updated at some
    // point in the future after being completed, publish an "order:updated"
    // event at this point

    msg.ack();
  }
}
