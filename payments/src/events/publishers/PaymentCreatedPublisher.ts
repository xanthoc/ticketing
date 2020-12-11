import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from "@xanthocticket/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
