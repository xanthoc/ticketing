import request from "supertest";
import mongoose from "mongoose";
import { OrderStatus } from "@xanthocticket/common";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order } from "../../models/order";
import { natsWrapper } from "../../natsWrapper";

it("returns 404 if the ticket does not exist", async () => {
  const ticketId = mongoose.Types.ObjectId().toHexString();
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signUp())
    .send({ ticketId })
    .expect(404);
});

it("returns 400 if the ticket is reserved", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 11,
  });
  await ticket.save();
  const order = Order.build({
    ticket,
    userId: "asdf",
    expiresAt: new Date(),
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signUp())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("returns an order object if everything's okay", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 11,
  });
  await ticket.save();

  const res = await request(app)
    .post("/api/orders")
    .set("Cookie", global.signUp())
    .send({ ticketId: ticket.id });

  expect(res.status).toEqual(201);
  expect(res.body.ticket.title).toEqual("concert");
  expect(res.body.ticket.price).toEqual(ticket.price);
  const order = await Order.findById(res.body.id);
  expect(order?.status).toEqual(OrderStatus.Created);
});

it("emits an order created event", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 11,
  });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signUp())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
