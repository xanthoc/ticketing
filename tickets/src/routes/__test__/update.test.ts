import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { natsWrapper } from "../../natsWrapper";
import { Ticket } from "../../models/ticket";

it("returns 404 if the provided id is not found", async () => {
  const id = new mongoose.Types.ObjectId();
  const hexId = id.toHexString();
  await request(app)
    .put(`/api/tickets/${hexId}`)
    .set("Cookie", global.signUp())
    .send({ title: "A good titile", price: 11 })
    .expect(404);
});

it("returns 401 if the request is made without login", async () => {
  const id = new mongoose.Types.ObjectId();
  const hexId = id.toHexString();
  await request(app)
    .put(`/api/tickets/${hexId}`)
    .send({ title: "A good titile", price: 11 })
    .expect(401);
});

it("returns 401 if the ticket is not owned by the requester", async () => {
  const ticket = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signUp())
    .send({ title: "This is a title", price: 11 });

  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set("Cookie", global.signUp())
    .send({ title: "This is a title", price: 11 })
    .expect(401);
});

it("returns 400 if the input is invalid", async () => {
  const cookie = global.signUp();
  const ticket = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "This is a title", price: 11 });

  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "", price: 11 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set("Cookie", cookie)
    .send({ price: 11 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "THIS IS A TITLE", price: -11 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "THIS IS A TITLE" })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set("Cookie", cookie)
    .send()
    .expect(400);
});

it("returns 200 and updates the ticket if everything's okay", async () => {
  const cookie = global.signUp();
  const ticket = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "This is a title", price: 11 });

  const updatedTitle = "THIS IS A TITLE";
  const updatedPrice = 22;

  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set("Cookie", cookie)
    .send({ title: updatedTitle, price: updatedPrice })
    .expect(200);

  const updated = await request(app)
    .get(`/api/tickets/${ticket.body.id}`)
    .send();
  expect(updated.body.title).toEqual(updatedTitle);
  expect(updated.body.price).toEqual(updatedPrice);
});

it("rejects update when the ticket is reserved", async () => {
  const cookie = global.signUp();
  const ticket = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "This is a title", price: 11 });
  const ticketFromDB = await Ticket.findById(ticket.body.id);
  ticketFromDB?.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticketFromDB?.save();

  const updatedTitle = "THIS IS A TITLE";
  const updatedPrice = 22;

  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set("Cookie", cookie)
    .send({ title: updatedTitle, price: updatedPrice })
    .expect(400);
});

it("publishes a ticket:updated event", async () => {
  const cookie = global.signUp();
  const ticket = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "This is a title", price: 11 });

  const updatedTitle = "THIS IS A TITLE";
  const updatedPrice = 22;

  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set("Cookie", cookie)
    .send({ title: updatedTitle, price: updatedPrice })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});
