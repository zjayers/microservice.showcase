import {
  EventPublisher,
  IOrderCancelledEvent,
  Subjects,
} from "@craterspace/common";

export class OrderCancelledPublisher extends EventPublisher<
  IOrderCancelledEvent
> {
  readonly subject = Subjects.OrderCancelled;
}
