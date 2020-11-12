// Import Modules
import {
  errorHandler,
  getCurrentUser,
  NotFoundError,
} from "@craterspace/common";

import cookieSession from "cookie-session";
import express, { Express } from "express";
import "express-async-errors";
import { getTicketsRouter } from "./routes/get-all";
import { getTicketRouter } from "./routes/get-ticket";
import { createTicketRouter } from "./routes/new-ticket";
import { updateTicketRouter } from "./routes/update-ticket";

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
app.use(createTicketRouter);
app.use(getTicketRouter);
app.use(getTicketsRouter);
app.use(updateTicketRouter);

// 404 Not Found
app.all("*", async () => {
  throw new NotFoundError();
});

// Global Error Handler
app.use(errorHandler);

// Export app module
export { app };
