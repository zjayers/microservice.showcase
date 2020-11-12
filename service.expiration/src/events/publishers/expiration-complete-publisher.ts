import {
  EventPublisher,
  IExpirationCompleteEvent,
  Subjects,
} from "@craterspace/common";

export class ExpirationCompletePublisher extends EventPublisher<
  IExpirationCompleteEvent
> {
  readonly subject: IExpirationCompleteEvent["subject"] =
    Subjects.ExpirationComplete;
}
