import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import jwt from "jsonwebtoken";

import { app } from "../app";

declare global {
  namespace NodeJS {
    interface Global {
      signUp(): string[];
    }
  }
}

jest.mock("../natsWrapper.ts");

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = "asdf";

  mongo = new MongoMemoryServer();
  const mongoURI = await mongo.getUri();
  await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signUp = () => {
  const idObj = new mongoose.Types.ObjectId();
  const id = idObj.toHexString();
  const email = "a@b.com";
  // build a payload
  const payload = { id, email };
  // create a jwt from the payload
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  // build a session object
  const session = { jwt: token };
  // turn that session object into JSON
  const sessionJSON = JSON.stringify(session);
  // encode that JSON as base64
  const sessionBase64 = Buffer.from(sessionJSON).toString("base64");
  // return a string that is the cookie
  return [`express:sess=${sessionBase64}`];
};
