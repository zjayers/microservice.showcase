// Import Modules
import mongoose from "mongoose";
import { app } from "./app";

// Connect to database
(async (): Promise<void> => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be defined");
  }

  try {
    await mongoose.connect("mongodb://auth-mongo-srv:27017/auth", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Auth Service - Connected to MongoDB");
  } catch (e) {
    console.log(e);
  }

  // Listen For Requests
  app.listen(3000, () => {
    console.log("Auth Service - Listening on port: 3000");
  });
})();
