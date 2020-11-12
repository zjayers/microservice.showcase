// * Imports
import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { natsClient } from "./events/nats-client";

// IIFE to be immediately invoked on file load
(async (): Promise<void> => {
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be defined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be defined");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be defined");
  }

  try {
    // Connect to NATS
    await natsClient.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    // Setup NATS listeners
    new OrderCreatedListener(natsClient.instance).listen();
  } catch (e) {
    console.log(e);
  }
})();
