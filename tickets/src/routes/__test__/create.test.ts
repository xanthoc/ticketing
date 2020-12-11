import request from "supertest";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../natsWrapper";

it("has a route handler listening to /aip/tickets for post request", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
  await request(app).post("/api/tickets").send({}).expect(401);
});

it("returns a status code other than 401 if the user is signed in", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signUp())
    .send({});
  expect(response.status).not.toEqual(401);
});

it("returns a status code of 400 if the title is invalid", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signUp())
    .send({
      title: "",
      price: 10,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signUp())
    .send({
      title: "",
      price: 10,
    })
    .expect(400);
});

it("returns a status code of 400 if the price is invalid", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signUp())
    .send({
      title: "a valid titile",
      price: -10,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signUp())
    .send({
      title: "a valid titile",
    })
    .expect(400);
});

it("creates a ticket with valid inputs", async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const title = "a valid titile";
  const price = 20.11;

  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signUp())
    .send({
      title,
      price,
    });

  expect(res.status).toEqual(201);
  expect(res.body.title).toEqual(title);
  expect(res.body.price).toEqual(price);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].title).toEqual(title);
  expect(tickets[0].price).toEqual(price);
});

it("publishes a ticket:created event", async () => {
  const title = "a valid titile";
  const price = 20.11;

  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signUp())
    .send({
      title,
      price,
    });

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});
