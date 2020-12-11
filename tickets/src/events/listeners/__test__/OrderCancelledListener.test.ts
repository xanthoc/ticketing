import { OrderCancelleddEvent } from "@xanthocticket/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

import { natsWrapper } from "../../../natsWrapper";
import { OrderCancelledListener } from "../OrderCancelledListener";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: "concert",
    price: 11,
    userId: "asdf",
  });
  ticket.set({ orderId });
  await ticket.save();

  const data: OrderCancelleddEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: { id: ticket.id },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, ticket, orderId, listener };
};

it("updates the ticket, publishes an event, and acks the message", async () => {
  const { msg, data, ticket, orderId, listener } = await setup();

  await listener.onMessage(data, msg);

  const updated = await Ticket.findById(ticket.id);
  expect(updated!.orderId).not.toBeDefined();
  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
  expect(msg.ack).toHaveBeenCalledTimes(1);
  const pubData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(pubData.id).toEqual(ticket.id);
});
