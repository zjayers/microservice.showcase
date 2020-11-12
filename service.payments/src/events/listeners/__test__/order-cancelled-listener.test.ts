import { IOrderCancelledEvent, OrderStatus } from "@craterspace/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderModel } from "../../../models/order-model";
import { natsClient } from "../../nats-client";
import { OrderCancelledListener } from "../order-cancelled-listener";

const { validTicketPrice } = global;

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCancelledListener(natsClient.instance);

  // Create and save a ticket
  const order = await OrderModel.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: validTicketPrice,
    status: OrderStatus.Created,
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });
  await order.save();

  // Create a fake data event
  const data: IOrderCancelledEvent["data"] = {
    id: order.id,
    version: 1,
    ticket: {
      id: mongoose.Types.ObjectId().toHexString(),
    },
  };

  // Create a fake msg
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, listener, data };
};

describe("Order Cancelled Listener", function () {
  it("should mark the order as cancelled", async function () {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const cancelledOrder = await OrderModel.findById(data.id);
    expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled);
  });

  it("should ack the msg on successful processing", async function () {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
  });
});
