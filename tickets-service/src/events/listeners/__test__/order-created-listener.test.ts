import { IOrderCreatedEvent, OrderStatus } from "@craterspace/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { TicketModel } from "../../../models/ticket-model";
import { natsClient } from "../../nats-client";
import { OrderCreatedListener } from "../order-created-listener";

const { validTicketPrice, validTicketTitle } = global;

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsClient.instance);

  // Create and save a ticket
  const ticket = TicketModel.build({
    price: validTicketPrice,
    title: validTicketTitle,
    userId: "abcd1234",
  });

  await ticket.save();

  // Create a fake data event
  const data: IOrderCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: "abcd1234",
    expiresAt: new Date().toISOString(),
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // Create a fake msg
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, listener, data, ticket };
};

describe("Order Created Listener", function () {
  it("should set the userId of the ticket", async () => {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const updatedTicket = await TicketModel.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(data.id);
  });

  it("should ack the msg if processing is successful", async () => {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });

  it("should publish a ticket updated event", async () => {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(natsClient.instance.publish).toHaveBeenCalled();

    const ticketUpdatedData = JSON.parse(
      (natsClient.instance.publish as jest.Mock).mock.calls[0][1]
    );
    expect(ticketUpdatedData.orderId).toEqual(ticketUpdatedData.orderId);
  });
});
