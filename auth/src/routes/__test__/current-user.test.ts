import request from "supertest";
import { app } from "../../app";

it("responds with details about the current user", async () => {
  const cookie = await global.signUp();
  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);
  expect(response.body.currentUser.email).toEqual("a@b.com");
});
it("returns null when no user logs in", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});
