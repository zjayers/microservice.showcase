import { IOrderCreatedEvent, OrderStatus } from "@craterspace/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderModel } from "../../../models/order-model";
import { natsClient } from "../../nats-client";
import { OrderCreatedListener } from "../order-created-listener";

const { validTicketPrice, validTicketTitle } = global;

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsClient.instance);

  // Create a fake data event
  const data: IOrderCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date().toISOString(),
    ticket: {
      id: mongoose.Types.ObjectId().toHexString(),
      price: validTicketPrice,
    },
  };

  // Create a fake msg
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, listener, data };
};

describe("Order Created Listener", function () {
  it("should duplicate the Order to the payments service database", async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const order = await OrderModel.findById(data.id);

    expect(order!.id).toEqual(data.id);
    expect(order!.price).toEqual(data.ticket.price);
    expect(order!.version).toEqual(data.version);
    expect(order!.status).toEqual(data.status);
    expect(order!.userId).toEqual(data.userId);
  });

  it("should ack the msg if processing is successful", async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });
});
