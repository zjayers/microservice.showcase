/* Import Modules */
import express from "express";
import "express-async-errors";
import { currentUserRouter } from "./routes/current-user";
import { signInRouter } from "./routes/signin";
import { signOutRouter } from "./routes/signout";
import { signUpRouter } from "./routes/signup";
import { errorHandler } from "./middleware/error-handler";
import { NotFoundError } from "./errors/not-found-error";

/* Init Express & Body-Parser*/
const app = express();
app.use(express.json());

/* Handlers */
app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

/* 404 Not Found */
app.all("*", async () => {
  throw new NotFoundError();
});

/* Global Error Handler */
app.use(errorHandler);

/* Listen For Requests */
app.listen(3000, () => {
  console.log("Auth Service - listening on port: 3000");
});
