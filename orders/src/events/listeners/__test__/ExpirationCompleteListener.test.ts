import { ExpirationCompleteEvent, OrderStatus } from "@xanthocticket/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";

import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../natsWrapper";
import { ExpirationCompleteListener } from "../ExpirationCompleteListener";

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "a movie",
    price: 111,
  });
  await ticket.save();

  const order = Order.build({
    userId: "asdf",
    expiresAt: new Date(),
    status: OrderStatus.Created,
    ticket,
  });
  await order.save();

  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, order, data, msg };
};

it("changes the order status to cancelled", async () => {
  const { msg, data, listener, order } = await setup();

  await listener.onMessage(data, msg);

  const orderFromDB = await Order.findById(order.id);
  expect(orderFromDB?.status).toEqual(OrderStatus.Cancelled);
});

it("publishes an order cancelled event", async () => {
  const { msg, data, listener, order } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
  const pubData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(pubData.id).toEqual(order.id);
});

it("acks the message", async () => {
  const { msg, data, listener, order } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalledTimes(1);
});
