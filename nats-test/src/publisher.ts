import nats from "node-nats-streaming";
import { TicketCreatedPublisher } from "./TicketCreatedPublisher";

console.clear();

const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});

stan.on("connect", async () => {
  console.log("Publisher connected to NATS");
  try {
    await new TicketCreatedPublisher(stan).publish({
      id: "123",
      title: "concert 11",
      price: 11,
      userId: "aaa",
    });
  } catch (err) {
    console.error(err);
  }
});
