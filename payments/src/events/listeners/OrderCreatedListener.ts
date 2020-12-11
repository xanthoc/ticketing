import { Listener, OrderCreatedEvent, Subjects } from "@xanthocticket/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

import { queueGroupName } from "./queueGroupName";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const order = Order.build({
      id: data.id,
      status: data.status,
      price: data.ticket.price,
      version: data.version,
      userId: data.userId,
    });
    await order.save();

    msg.ack();
  }
}
