import {
  EventPublisher,
  ITicketCreatedEvent,
  Subjects,
} from "@craterspace/common";

export class TicketCreatedPublisher extends EventPublisher<
  ITicketCreatedEvent
> {
  readonly subject = Subjects.TicketCreated;
}
