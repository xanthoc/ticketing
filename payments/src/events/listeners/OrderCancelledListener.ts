import {
  Listener,
  OrderCancelleddEvent,
  OrderStatus,
  Subjects,
} from "@xanthocticket/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queueGroupName";

export class OrderCancelledListener extends Listener<OrderCancelleddEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCancelleddEvent["data"], msg: Message) {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });
    if (!order) {
      throw new Error("Order not found");
    }
    order.set({
      status: OrderStatus.Cancelled,
    });
    await order.save();

    msg.ack();
  }
}
