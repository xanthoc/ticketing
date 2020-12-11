import { Message } from "node-nats-streaming";
import { Listener } from "@xanthocticket/common";
import { Subjects } from "@xanthocticket/common";
import { TicketCreatedEvent } from "@xanthocticket/common";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = "payment-service";
  onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    console.log("Event rcvd:", data);
    msg.ack();
  }
}
