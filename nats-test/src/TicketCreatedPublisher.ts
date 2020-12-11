import { Publisher } from "@xanthocticket/common";
import { Subjects } from "@xanthocticket/common";
import { TicketCreatedEvent } from "@xanthocticket/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
