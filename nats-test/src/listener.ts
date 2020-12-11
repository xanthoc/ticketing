import nats, { Message } from "node-nats-streaming";
import { randomBytes } from "crypto";
import { TicketUpdatedListener } from "./TicketUpdatedListener";

console.clear();

const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to NATS");
  new TicketUpdatedListener(stan).listen();
  stan.on("close", () => {
    console.log("NATS connection closed!");
    process.exit();
  });
});

process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());
