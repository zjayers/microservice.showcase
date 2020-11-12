import {
  IOrderCancelledEvent,
  IOrderCreatedEvent,
  OrderStatus,
} from "@craterspace/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { TicketModel } from "../../../models/ticket-model";
import { natsClient } from "../../nats-client";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { OrderCreatedListener } from "../order-created-listener";

const { validTicketPrice, validTicketTitle } = global;

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCancelledListener(natsClient.instance);

  // Create and save a ticket
  const orderId = mongoose.Types.ObjectId().toHexString();

  const ticket = TicketModel.build({
    price: validTicketPrice,
    title: validTicketTitle,
    userId: "abcd1234",
  });

  ticket.set({ orderId: orderId });

  await ticket.save();

  // Create a fake data event
  const data: IOrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // Create a fake msg
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, listener, data, ticket, orderId };
};

describe("Order Cancelled Listener", function () {
  it("should update the ticket and remove the orderId from it", async function () {
    const { listener, ticket, data, msg, orderId } = await setup();
    await listener.onMessage(data, msg);

    const updatedTicket = await TicketModel.findById(ticket.id);
    expect(updatedTicket!.orderId).not.toBeDefined();
  });

  it("should ack the msg on successful processing", async function () {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
  });

  it("should publish a ticket updated event", async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(natsClient.instance.publish).toHaveBeenCalled();

    const ticketUpdatedData = JSON.parse(
      (natsClient.instance.publish as jest.Mock).mock.calls[0][1]
    );
    expect(ticketUpdatedData.orderId).toEqual(ticketUpdatedData.orderId);
  });
});
