import mongoose from "mongoose";
import request from "supertest";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";

it("returns the order that the request has created", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 11,
  });
  await ticket.save();

  const user = global.signUp();
  const order = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const fetched = await request(app)
    .get(`/api/orders/${order.body.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

  expect(order.body.id).toEqual(fetched.body.id);
});

it("returns 401 if the request is not the user who created the order", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 11,
  });
  await ticket.save();

  const order = await request(app)
    .post("/api/orders")
    .set("Cookie", global.signUp())
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .get(`/api/orders/${order.body.id}`)
    .set("Cookie", global.signUp())
    .send()
    .expect(401);
});
