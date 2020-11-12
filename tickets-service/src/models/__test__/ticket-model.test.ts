import { TicketModel } from "../ticket-model";

const { validTicketTitle, validTicketPrice } = global;

describe("Ticket Model", function () {
  it("should implement optimistic concurrency control by updating version numbers on doc updates", async () => {
    // Create an instance of a ticket
    const ticket = TicketModel.build({
      title: validTicketTitle,
      price: validTicketPrice,
      userId: "abcd1234",
    });

    // Save the ticket to the database
    await ticket.save();

    // Fetch the ticket twice
    const firstTicketInstance = await TicketModel.findById(ticket.id);
    const secondTicketInstance = await TicketModel.findById(ticket.id);

    // Make individual change to each ticket
    firstTicketInstance!.set({ price: 10 });
    secondTicketInstance!.set({ price: 15 });

    // Save the first fetched ticket - This will work as expected
    await firstTicketInstance!.save();

    // Save the second fetched ticket - This will fail due to an outdated
    // version number
    await expect(secondTicketInstance!.save()).rejects.toThrow();
  });

  it("should increment the version number on multiple saves", async () => {
    // Create an instance of a ticket
    const ticket = TicketModel.build({
      title: validTicketTitle,
      price: validTicketPrice,
      userId: "abcd1234",
    });

    // Save the ticket to the database
    await ticket.save();
    expect(ticket.version).toEqual(0);

    await ticket.save();
    expect(ticket.version).toEqual(1);

    await ticket.save();
    expect(ticket.version).toEqual(2);
  });
});
