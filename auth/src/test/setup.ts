/* tslint:disable:no-implicit-dependencies no-backbone-get-set-outside-model */
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import supertest, { Response } from "supertest";
import { app } from "../app";

declare global {
  namespace NodeJS {
    interface Global {
      signUpRoute: string;
      signInRoute: string;
      signOutRoute: string;
      currentUserRoute: string;
      validEmail: string;
      validPassword: string;
      invalidEmail: string;
      invalidPassword: string;

      signUp(): Promise<string[]>;
    }
  }
}

let mongo: MongoMemoryServer;

beforeAll(
  async (): Promise<void> => {
    process.env.JWT_SECRET = "jwtkey";

    mongo = new MongoMemoryServer();
    const mongoUri: string = await mongo.getUri();

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
);

beforeEach(
  async (): Promise<void> => {
    const collections = await mongoose.connection.db.collections();

    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
);

afterAll(
  async (): Promise<void> => {
    await mongo.stop();
    await mongoose.connection.close();
  }
);

global.signUpRoute = "/api/users/signup";
global.signInRoute = "/api/users/signin";
global.signOutRoute = "/api/users/signout";
global.currentUserRoute = "/api/users/currentuser";
global.validEmail = "test@test.com";
global.validPassword = "password";
global.invalidEmail = "test.com";
global.invalidPassword = ".";

global.signUp = async (): Promise<string[]> => {
  const { signUpRoute, validEmail, validPassword } = global;
  const response: Response = await supertest(app)
    .post(signUpRoute)
    .send({
      email: validEmail,
      password: validPassword,
    })
    .expect(201);

  return response.get("Set-Cookie");
};
