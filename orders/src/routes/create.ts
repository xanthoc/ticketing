import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireLogin,
  validateRequest,
} from "@xanthocticket/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import { OrderCreatedPublisher } from "../events/publishers/OrderCreatedPublisher";
import { Order } from "../models/order";
import { Ticket } from "../models/ticket";
import { natsWrapper } from "../natsWrapper";

const router = express.Router();

const EXPIRATION_WINDOW_SECOND = 30;

router.post(
  "/api/orders",
  requireLogin,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("A valid ticket id must be provided."),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    const existingOrder = await Order.findOne({
      ticket,
      status: {
        $in: [
          OrderStatus.Created,
          OrderStatus.AwaitingPayment,
          OrderStatus.Complete,
        ],
      },
    });
    if (existingOrder) {
      throw new BadRequestError("The ticket is already reserved.");
    }

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECOND);

    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });
    await order.save();

    await new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: { id: order.ticket.id, price: order.ticket.price },
      expiresAt: order.expiresAt.toISOString(),
      status: order.status,
      userId: order.userId,
    });

    res.status(201).send(order);
  }
);

export { router as createOrdersRouter };
