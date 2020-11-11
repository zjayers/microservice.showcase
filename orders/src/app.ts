// Import Modules
import {
  errorHandler,
  getCurrentUser,
  NotFoundError,
} from "@craterspace/common";

import cookieSession from "cookie-session";
import express, { Express } from "express";
import "express-async-errors";

import { cancelOrderRouter } from "./routes/cancel-order";
import { getOrdersRouter } from "./routes/get-all";
import { getOrderRouter } from "./routes/get-order";
import { createOrderRouter } from "./routes/new-order";

// Init Express & Body-Parser
const app: Express = express();
app.set("trust proxy", true);

// Body parser
app.use(express.json());

// Cookie Session
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

app.use(getCurrentUser);

// Handlers
app.use(cancelOrderRouter);
app.use(getOrdersRouter);
app.use(getOrderRouter);
app.use(createOrderRouter);

// 404 Not Found
app.all("*", async () => {
  throw new NotFoundError();
});

// Global Error Handler
app.use(errorHandler);

// Export app module
export { app };
