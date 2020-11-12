import { IExpirationCompleteEvent, OrderStatus } from "@craterspace/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderModel } from "../../../models/order-model";
import { TicketModel } from "../../../models/ticket-model";
import { natsClient } from "../../nats-client";
import { ExpirationCompleteListener } from "../expiration-complete-listener";

const { validTicketTitle, validTicketPrice } = global;

const setup = async () => {
  // Create an instance of the listener
  const listener = new ExpirationCompleteListener(natsClient.instance);

  // Create a ticket
  const ticket = await TicketModel.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: validTicketPrice,
    title: validTicketTitle,
  });
  await ticket.save();

  // Create an order
  const order = await OrderModel.build({
    expiresAt: new Date(),
    status: OrderStatus.Created,
    ticket: ticket,
    userId: mongoose.Types.ObjectId().toHexString(),
  });
  await order.save();

  // Create a fake data event
  const data: IExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };

  // Create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, order, ticket };
};

describe("Expiration Complete Listener", function () {
  it("should update an order status to cancelled", async () => {
    const { listener, data, msg, order } = await setup();
    await listener.onMessage(data, msg);

    const updatedOrder = await OrderModel.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
  });

  it("should ack the message", async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
  });

  it("should emit an order cancelled event", async () => {
    const { listener, data, msg, order } = await setup();
    await listener.onMessage(data, msg);

    expect(natsClient.instance.publish).toHaveBeenCalled();

    const eventData = JSON.parse(
      (natsClient.instance.publish as jest.Mock).mock.calls[0][1]
    );

    expect(eventData.id).toEqual(order.id);
  });
});
