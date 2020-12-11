import { Message } from "node-nats-streaming";
import { Listener } from "@xanthocticket/common";
import { Subjects } from "@xanthocticket/common";
import { TicketUpdatedEvent } from "@xanthocticket/common";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = "payment-service";
  onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    console.log("Event rcvd:", data);
    msg.ack();
  }
}
