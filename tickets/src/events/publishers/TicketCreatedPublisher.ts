import { Publisher, Subjects, TicketCreatedEvent } from "@xanthocticket/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
