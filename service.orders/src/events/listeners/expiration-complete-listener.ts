import {
  EventListener,
  IExpirationCompleteEvent,
  NotFoundError,
  OrderStatus,
  Subjects,
} from "@craterspace/common";
import { Message } from "node-nats-streaming";
import { OrderModel } from "../../models/order-model";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";
import { QUEUE_GROUP_NAME } from "../queue-group-name";

export class ExpirationCompleteListener extends EventListener<
  IExpirationCompleteEvent
> {
  readonly queueGroupName: string = QUEUE_GROUP_NAME;
  readonly subject: IExpirationCompleteEvent["subject"] =
    Subjects.ExpirationComplete;

  async onMessage(data: IExpirationCompleteEvent["data"], msg: Message) {
    // Find the relevant order in the database
    const order = await OrderModel.findById(data.orderId).populate("ticket");

    if (!order) throw new NotFoundError();

    // Do not cancel a completed order
    if (order.status === OrderStatus.Complete) {
      return msg.ack();
    }

    // Set the status of the order as cancelled
    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    // Publish an event that the order has been cancelled
    new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      ticket: {
        id: order.ticket.id,
      },
      version: order.version,
    });

    msg.ack();
  }
}
