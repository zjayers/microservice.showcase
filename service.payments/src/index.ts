// * Imports
import { app } from "./app";
import mongoose from "mongoose";
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { natsClient } from "./events/nats-client";

// IIFE to be immediately invoked on file load
(async (): Promise<void> => {
  // Ensure required environment variables exist
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be defined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be defined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be defined");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be defined");
  }
  if (!process.env.STRIPE_SECRET) {
    throw new Error("NATS_CLIENT_ID must be defined");
  }

  try {
    // Connect To Mongoose
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    console.log("Payments Service - Connected to MongoDB");

    // Connect to NATS
    await natsClient.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    // Setup NATS listeners
    new OrderCreatedListener(natsClient.instance).listen();
    new OrderCancelledListener(natsClient.instance).listen();
  } catch (e) {
    console.log(e);
  }

  // Listen For Requests
  app.listen(3000, () => {
    console.log("Payments Service - Listening on port: 3000");
  });
})();
