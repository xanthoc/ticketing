import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import {
  currentUser,
  errorHandler,
  NotFoundError,
} from "@xanthocticket/common";

import { createOrdersRouter } from "./routes/create";
import { showOrderRouter } from "./routes/show";
import { listOrdersRouter } from "./routes/list";
import { deleteOrderRouter } from "./routes/delete";

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

app.use(createOrdersRouter);
app.use(showOrderRouter);
app.use(listOrdersRouter);
app.use(deleteOrderRouter);

app.all("/*", () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
