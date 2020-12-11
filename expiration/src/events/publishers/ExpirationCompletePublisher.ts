import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from "@xanthocticket/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
