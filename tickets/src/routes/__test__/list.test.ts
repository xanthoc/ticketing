import request from "supertest";
import { app } from "../../app";

const createTicket = () => {
  return request(app)
    .post("/api/tickets")
    .set("Cookie", global.signUp())
    .send({ title: "this is a title", price: 22 });
};

it("returns all the tickets", async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const res = await request(app).get("/api/tickets").send();

  expect(res.status).toEqual(200);
  expect(res.body.length).toEqual(3);
});
