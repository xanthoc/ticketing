import request from "supertest";
import { app } from "../../app";

it("allows signin with given valid credential and supplies a cookie", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "a@b.com",
      password: "12345678",
    })
    .expect(201);
  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email: "a@b.com",
      password: "12345678",
    })
    .expect(200);
  expect(response.get("Set-Cookie")).toBeDefined();
});
it("disallows signin with given wrong passward and not supplies a cookie", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "a@b.com",
      password: "12345678",
    })
    .expect(201);
  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email: "a@b.com",
      password: "12345679",
    })
    .expect(400);
  expect(response.get("Set-Cookie")).toBeUndefined();
});
it("disallows signin with unregistered email and not supplies a cookie", async () => {
  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email: "a@b.com",
      password: "12345678",
    })
    .expect(400);
  expect(response.get("Set-Cookie")).toBeUndefined();
});
