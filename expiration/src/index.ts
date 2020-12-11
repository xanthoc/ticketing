import { OrderCreatedListener } from "./events/listeners/OrderCreatedListener";
import { natsWrapper } from "./natsWrapper";

const start = async () => {
  if (!process.env.REDIS_HOST) {
    throw new Error("REDIS_HOST is not defined!");
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

    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (err) {
    console.error(err);
  }
};

start();
