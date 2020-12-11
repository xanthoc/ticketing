import mongoose from "mongoose";

import { natsWrapper } from "../../../natsWrapper";
import { OrderCreatedListener } from "../OrderCreatedListener";
import { Ticket } from "../../../models/ticket";
import { OrderCreatedEvent, OrderStatus } from "@xanthocticket/common";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  const ticket = Ticket.build({
    title: "concert",
    price: 11,
    userId: "asdf",
  });
  await ticket.save();

  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
    status: OrderStatus.Created,
    expiresAt: "asdf",
    userId: "asdf",
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { msg, data, ticket, listener };
};

it("saves the order id to the ticket", async () => {
  const { msg, data, ticket, listener } = await setup();

  await listener.onMessage(data, msg);

  const updated = await Ticket.findById(ticket.id);
  expect(updated?.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { msg, data, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalledTimes(1);
});

it("publishes a ticket updated event", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
  const pubData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(pubData.orderId).toEqual(data.id);
});
