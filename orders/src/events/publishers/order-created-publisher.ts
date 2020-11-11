import {
  EventPublisher,
  IOrderCreatedEvent,
  Subjects,
} from "@craterspace/common";

export class OrderCreatedPublisher extends EventPublisher<IOrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
