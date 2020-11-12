// Import Modules
import {
  errorHandler,
  getCurrentUser,
  NotFoundError,
} from "@craterspace/common";

import cookieSession from "cookie-session";
import express, { Express } from "express";
import "express-async-errors";
import { newChargeRouter } from "./routes/new-charge";

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
app.use(newChargeRouter);

// 404 Not Found
app.all("*", async () => {
  throw new NotFoundError();
});

// Global Error Handler
app.use(errorHandler);

// Export app module
export { app };
