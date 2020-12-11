import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";

it("returns 404 if the requested ticket is not found", async () => {
  const id = mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it("returns the ticket if the requested tick is found", async () => {
  const title = "this is a ticket";
  const price = 20;
  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signUp())
    .send({ title, price })
    .expect(201);

  const ticketRes = await request(app)
    .get(`/api/tickets/${res.body.id}`)
    .send()
    .expect(200);
  expect(ticketRes.body.title).toEqual(title);
  expect(ticketRes.body.price).toEqual(price);
});
