import mongoose from "mongoose";
import request from "supertest";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";

const createTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 11,
  });
  return ticket.save();
};

const createOrder = async (cookie: string[], ticketId: string) => {
  return request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({ ticketId });
};

it("returns orders that the user has created", async () => {
  // create three tickets
  const ticket1 = await createTicket();
  const ticket2 = await createTicket();
  const ticket3 = await createTicket();

  const user1 = global.signUp();
  const user2 = global.signUp();
  // create one order with user1
  const order = await createOrder(user1, ticket1.id);
  expect(order.status).toEqual(201);

  // create two orders with user2
  const order1 = await createOrder(user2, ticket2.id);
  expect(order1.status).toEqual(201);
  const order2 = await createOrder(user2, ticket3.id);
  expect(order2.status).toEqual(201);

  // fetch orders of user2
  const res = await request(app)
    .get("/api/orders")
    .set("Cookie", user2)
    .send()
    .expect(200);

  // check the results
  expect(res.body.length).toEqual(2);
  expect(res.body[0].id).toEqual(order1.body.id);
  expect(res.body[1].id).toEqual(order2.body.id);
});
