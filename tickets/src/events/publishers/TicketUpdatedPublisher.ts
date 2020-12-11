import { Publisher, Subjects, TicketUpdatedEvent } from "@xanthocticket/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
