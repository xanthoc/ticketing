import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireLogin,
  validateRequest,
} from "@xanthocticket/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { PaymentCreatedPublisher } from "../events/publishers/PaymentCreatedPublisher";
import { Order } from "../models/order";
import { Payment } from "../models/payment";
import { natsWrapper } from "../natsWrapper";
import { stripe } from "../stripe";

const router = express.Router();

router.post(
  "/api/payments",
  requireLogin,
  [
    body("token")
      .not()
      .isEmpty()
      .withMessage("A valid token must be provided."),
    body("orderId")
      .not()
      .isEmpty()
      .withMessage("A valid order id must be provided."),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;
    const order = await Order.findById(orderId).exec();
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("You can not pay for cancelled order");
    }
    const charge = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100,
      source: token,
    });

    const payment = Payment.build({
      orderId,
      stripeId: charge.id,
    });
    await payment.save();
    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send(payment);
  }
);

export { router as createChargeRouter };
