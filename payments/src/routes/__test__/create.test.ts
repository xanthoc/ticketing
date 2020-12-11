import { OrderStatus } from "@xanthocticket/common";
import mongoose from "mongoose";
import request from "supertest";

import { app } from "../../app";
import { Order } from "../../models/order";
import { Payment } from "../../models/payment";
import { stripe } from "../../stripe";

const url = "/api/payments";

// jest.mock("../../stripe.ts");

it("returns 404 if the order to pay does not exist", async () => {
  await request(app)
    .post(url)
    .set("Cookie", global.signUp())
    .send({
      token: "fjdkslfjdlks",
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it("returns 401 if the order to pay belongs to other user", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 22,
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
  });
  await order.save();

  await request(app)
    .post(url)
    .set("Cookie", global.signUp())
    .send({
      token: "fjdkslfjdlks",
      orderId: order.id,
    })
    .expect(401);
});

it("returns 400 if the order is in cancelled status", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 22,
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Cancelled,
    version: 0,
  });
  await order.save();

  await request(app)
    .post(url)
    .set("Cookie", global.signUp(order.userId))
    .send({
      token: "fjdkslfjdlks",
      orderId: order.id,
    })
    .expect(400);
});

it("creates a charge when everything's okay", async () => {
  const price = Math.floor(Math.random() * 100000);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price,
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
  });
  await order.save();

  await request(app)
    .post(url)
    .set("Cookie", global.signUp(order.userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);

  // const callArgs = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  // expect(callArgs.currency).toEqual("usd");
  // expect(callArgs.amount).toEqual(order.price * 100);
  // expect(callArgs.source).toEqual("tok_visa");
  const recentCharges = await stripe.charges.list({ limit: 50 });
  const charge = recentCharges.data.find((ea) => {
    return ea.amount === price * 100;
  });
  expect(charge).toBeDefined();
  expect(charge!.currency).toEqual("usd");

  const payment = await Payment.findOne({
    orderId: order.id,
  });
  expect(payment).not.toBeNull();
  expect(payment!.stripeId).toEqual(charge!.id);
});
