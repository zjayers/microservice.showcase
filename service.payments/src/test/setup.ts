/* tslint:disable:no-implicit-dependencies no-backbone-get-set-outside-model */
import { TokenManager } from "@craterspace/common";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

declare global {
  namespace NodeJS {
    interface Global {
      paymentsRoute: string;
      validTicketTitle: string;
      validTicketPrice: number;
      invalidTicketTitle: string;
      invalidTicketPrice: number;
      updatedTicketTitle: string;
      updatedTicketPrice: number;

      signUp(userId?: mongoose.Types.ObjectId): string[];
    }
  }
}

// File Mocks
jest.mock("../events/nats-client", () =>
  jest.requireActual("../events/__mocks__/nats-client")
);

// Use the below mock if mocking the stripe mock file
// jest.mock("../stripe", () => jest.requireActual("../__mocks__/stripe"));

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
    jest.clearAllMocks();
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

global.paymentsRoute = "/api/payments";
global.validTicketPrice = 10;
global.invalidTicketPrice = -10;
global.validTicketTitle = "Concert";
global.invalidTicketTitle = "";
global.updatedTicketTitle = "Updated Title";
global.updatedTicketPrice = 1000000;

global.signUp = (userId?: mongoose.Types.ObjectId): string[] =>
  TokenManager.SpoofToken(userId);
