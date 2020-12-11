import mongoose from "mongoose";

import { app } from "./app";
import { ExpirationCompleteListener } from "./events/listeners/ExpirationCompleteListener";
import { PaymentCreatedListener } from "./events/listeners/PaymentCreatedListener";
import { TicketCreatedListener } from "./events/listeners/TicketCreatedListener";
import { TicketUpdatedListener } from "./events/listeners/TicketUpdatedListener";
import { natsWrapper } from "./natsWrapper";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY is not defined!");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined!");
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID is not defined!");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID is not defined!");
  }
  if (!process.env.NATS_URI) {
    throw new Error("NATS_URI is not defined!");
  }
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URI
    );
    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed.");
      process.exit();
    });
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Connected to mongo db");
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000...");
  });
};

start();
