import {
  EventPublisher,
  ITicketUpdatedEvent,
  Subjects,
} from "@craterspace/common";

export class TicketUpdatedPublisher extends EventPublisher<
  ITicketUpdatedEvent
> {
  readonly subject = Subjects.TicketUpdated;
}
