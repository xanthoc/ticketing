import { requireLogin, validateRequest } from "@xanthocticket/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { TicketCreatedPublisher } from "../events/publishers/TicketCreatedPublisher";
import { Ticket } from "../models/ticket";
import { natsWrapper } from "../natsWrapper";

const router = express.Router();

router.post(
  "/api/tickets",
  requireLogin,
  [
    body("title").not().isEmpty().withMessage("Title must be provided."),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0."),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    });
    await ticket.save();
    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });
    res.status(201).send(ticket);
  }
);

export { router as createTicketsRouter };
