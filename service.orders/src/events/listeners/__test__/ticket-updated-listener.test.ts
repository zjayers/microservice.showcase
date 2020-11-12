import { ITicketUpdatedEvent } from "@craterspace/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { TicketModel } from "../../../models/ticket-model";
import { natsClient } from "../../nats-client";
import { TicketUpdatedListener } from "../ticket-updated-listener";

const { validTicketTitle, validTicketPrice } = global;

describe("Ticket Updated Listener", function () {
  const setup = async () => {
    // Create an instance of the listener
    const listener = new TicketUpdatedListener(natsClient.instance);

    // Create and save a ticket
    const ticket = await TicketModel.build({
      id: mongoose.Types.ObjectId().toHexString(),
      price: validTicketPrice,
      title: validTicketTitle,
    });

    await ticket.save();

    // Create a fake data event
    const data: ITicketUpdatedEvent["data"] = {
      id: ticket.id,
      version: ticket.version + 1,
      title: validTicketTitle + "Updated",
      price: validTicketPrice + 100,
      userId: mongoose.Types.ObjectId().toHexString(),
    };

    // Create a fake message object
    // @ts-ignore
    const msg: Message = {
      ack: jest.fn(),
    };

    return { listener, data, msg, ticket };
  };

  it("should find, update, and save a ticket", async function () {
    // Call the onMessage function with the data object & message object
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    // Assert a ticket was updated
    const ticket = await TicketModel.findById(data.id);

    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
    expect(ticket!.version).toEqual(data.version);
  });

  it("should ack the message", async function () {
    // Call the onMessage function with the data object & message object
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });

  it("should not ack the message if the event has skipped a version number", async function () {
    const { listener, data, msg, ticket } = await setup();

    data.version = 10;

    await expect(listener.onMessage(data, msg)).rejects.toThrow();
    expect(msg.ack).not.toHaveBeenCalled();
  });
});
