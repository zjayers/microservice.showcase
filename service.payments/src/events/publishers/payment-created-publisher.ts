import {
  EventPublisher,
  IPaymentCreatedEvent,
  Subjects,
} from "@craterspace/common";

export class PaymentCreatedPublisher extends EventPublisher<
  IPaymentCreatedEvent
> {
  readonly subject: IPaymentCreatedEvent["subject"] = Subjects.PaymentCreated;
}
