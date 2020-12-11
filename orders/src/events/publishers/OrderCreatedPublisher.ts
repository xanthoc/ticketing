import { OrderCreatedEvent, Publisher, Subjects } from "@xanthocticket/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
