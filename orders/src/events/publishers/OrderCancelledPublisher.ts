import {
  OrderCancelleddEvent,
  Publisher,
  Subjects,
} from "@xanthocticket/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelleddEvent> {
  readonly subject = Subjects.OrderCancelled;
}
