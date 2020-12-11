import { TicketUpdatedEvent } from "@xanthocticket/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../natsWrapper";
import { TicketUpdatedListener } from "../TicketUpdatedListener";

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();
  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: "new concert",
    price: 111,
    userId: "asdf",
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { msg, data, ticket, listener };
};

it("finds, changes, and updates a ticket", async () => {
  const { msg, data, ticket, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it("acks the message", async () => {
  const { msg, data, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalledTimes(1);
});

it("does not ack the message if the version is not in order", async () => {
  const { msg, data, listener } = await setup();
  data.version += 1;

  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  expect(msg.ack).toHaveBeenCalledTimes(0);
});
