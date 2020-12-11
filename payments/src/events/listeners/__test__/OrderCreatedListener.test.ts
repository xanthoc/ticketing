import mongoose from "mongoose";
import { OrderCreatedEvent, OrderStatus } from "@xanthocticket/common";

import { natsWrapper } from "../../../natsWrapper";
import { OrderCreatedListener } from "../OrderCreatedListener";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 11,
    },
    expiresAt: new Date().toISOString(),
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, listener };
};

it("stores a new order object", async () => {
  const { data, msg, listener } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);
  expect(order!.price).toEqual(data.ticket.price);
});

it("acks the message", async () => {
  const { data, msg, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalledTimes(1);
});
