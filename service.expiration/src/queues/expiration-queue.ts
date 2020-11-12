// * Imports
import Queue from "bull";
import { natsClient } from "../events/nats-client";
import { ExpirationCompletePublisher } from "../events/publishers/expiration-complete-publisher";

// interface for data that will be flowing through the BullJS Queue
interface IPayload {
  orderId: string;
}

// Setup BullJS Queue
const expirationQueue = new Queue<IPayload>("order:expiration", {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

// Setup processing logic for jobs inside of the expiration Queue
expirationQueue.process(async (job) => {
  await new ExpirationCompletePublisher(natsClient.instance).publish({
    orderId: job.data.orderId,
  });
});

// * Exports
export { expirationQueue };
