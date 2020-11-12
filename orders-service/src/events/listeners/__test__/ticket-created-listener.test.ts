import { ITicketCreatedEvent } from "@craterspace/common";
import { Message } from "node-nats-streaming";
import { TicketModel } from "../../../models/ticket-model";
import { natsClient } from "../../nats-client";
import { TicketCreatedListener } from "../ticket-created-listener";
import mongoose from "mongoose";

const { validTicketTitle, validTicketPrice } = global;

describe("Ticket Created Listener", function () {
  const setup = async () => {
    // Create an instance of the listener
    const listener = new TicketCreatedListener(natsClient.instance);

    // Create a fake data event
    const data: ITicketCreatedEvent["data"] = {
      version: 0,
      id: mongoose.Types.ObjectId().toHexString(),
      title: validTicketTitle,
      price: validTicketPrice,
      userId: mongoose.Types.ObjectId().toHexString(),
    };

    // Create a fake message object
    // @ts-ignore
    const msg: Message = {
      ack: jest.fn(),
    };

    return { listener, data, msg };
  };

  it("should create and save a ticket", async function () {
    // Call the onMessage function with the data object & message object
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    // Assert a ticket was created
    const ticket = await TicketModel.findById(data.id);

    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
  });

  it("should ack the message", async function () {
    // Call the onMessage function with the data object & message object
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });
});
