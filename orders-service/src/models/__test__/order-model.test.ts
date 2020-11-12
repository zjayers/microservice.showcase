import { OrderStatus } from "@craterspace/common";
import mongoose from "mongoose";
import { TicketModel } from "../ticket-model";
import { OrderModel } from "../order-model";

const { validTicketTitle, validTicketPrice } = global;

describe("Order Model", function () {
  it("should implement optimistic concurrency control by updating version numbers on doc updates", async () => {
    // Create an instance of a ticket
    const ticket = TicketModel.build({
      id: mongoose.Types.ObjectId().toHexString(),
      title: validTicketTitle,
      price: validTicketPrice,
    });

    // Save the ticket to the database
    await ticket.save();

    // Create an instance of a model
    const order = OrderModel.build({
      ticket,
      userId: "abcd1234",
      status: OrderStatus.Created,
      expiresAt: new Date(),
    });

    // Save the order to the database
    await order.save();

    // Fetch the ticket twice
    const firstOrderInstance = await OrderModel.findById(order.id);
    const secondOrderInstance = await OrderModel.findById(order.id);

    // Make individual change to each ticket
    firstOrderInstance!.set({ status: OrderStatus.AwaitingPayment });
    secondOrderInstance!.set({ status: OrderStatus.Complete });

    // Save the first fetched ticket - This will work as expected
    await firstOrderInstance!.save();

    // Save the second fetched ticket - This will fail due to an outdated
    // version number
    await expect(secondOrderInstance!.save()).rejects.toThrow();
  });

  it("should increment the version number on multiple saves", async () => {
    // Create an instance of a ticket
    const ticket = TicketModel.build({
      id: mongoose.Types.ObjectId().toHexString(),
      title: validTicketTitle,
      price: validTicketPrice,
    });

    // Save the ticket to the database
    await ticket.save();

    // Create an instance of a model
    const order = OrderModel.build({
      ticket,
      userId: "abcd1234",
      status: OrderStatus.Created,
      expiresAt: new Date(),
    });

    // Save the order to the database
    await order.save();
    expect(order.version).toEqual(0);

    await order.save();
    expect(order.version).toEqual(1);

    await order.save();
    expect(order.version).toEqual(2);
  });
});
