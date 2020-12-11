import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import {
  currentUser,
  errorHandler,
  NotFoundError,
} from "@xanthocticket/common";

import { createTicketsRouter } from "./routes/create";
import { showTicketRouter } from "./routes/show";
import { listTicketsRouter } from "./routes/list";
import { updateTicketRouter } from "./routes/update";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);
app.use(currentUser);

app.use(createTicketsRouter);
app.use(showTicketRouter);
app.use(listTicketsRouter);
app.use(updateTicketRouter);

app.all("/*", () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
