import {
  ExpirationCompleteEvent,
  Listener,
  OrderStatus,
  Subjects,
} from "@xanthocticket/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/OrderCancelledPublisher";

import { queueGroupName } from "./queueGroupName";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;
  async onMessage(data: ExpirationCompleteEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId).populate("ticket");
    if (!order) {
      throw new Error("Order not found; this can't happen!!!");
    }
    if (order.status !== OrderStatus.Complete) {
      order.set({ status: OrderStatus.Cancelled });
      await order.save();

      await new OrderCancelledPublisher(this.client).publish({
        id: order.id,
        version: order.version,
        ticket: { id: order.ticket.id },
      });
    }

    msg.ack();
  }
}
