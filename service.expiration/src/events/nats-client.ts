// * Imports
import nats, { Stan } from "node-nats-streaming";

// Singleton NATS client to allow nats connections and avoid cyclical imports
class NatsClient {
  private _client?: Stan;

  // Getter to return the nats client instance
  get instance(): Stan {
    if (!this._client)
      throw new Error("Cannot access NATS client before connecting");
    return this._client;
  }

  // CONNECT to the nats service
  connect(clusterId: string, clientId: string, connectionUrl: string) {
    this._client = nats.connect(clusterId, clientId, { url: connectionUrl });

    // Return a promise so the invocations can be awaited in outer functions
    return new Promise((resolve, reject) => {
      this.instance.on("connect", () => {
        console.log("Expiration Service - Connected to NATS Client");
        resolve();
      });

      // Setup error handling
      this.instance.on("error", (err) => {
        reject(err);
      });

      this.instance.on("close", () => {
        console.log(`Expiration Service - Disconnected from NATS`);
        process.exit();
      });

      // Setup SIGINT and SIGTERM onClose listeners
      process.on("SIGINT", () => {
        this.instance.close();
      });
      process.on("SIGTERM", () => {
        this.instance.close();
      });
    });
  }
}

// * Exports
export const natsClient = new NatsClient();
