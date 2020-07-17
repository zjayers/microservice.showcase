// Import Modules
import express, { Express } from 'express';
import mongoose from 'mongoose';

import 'express-async-errors';

import { NotFoundError } from './errors/not-found-error';
import { errorHandler } from './middleware/error-handler';
import { currentUserRouter } from './routes/current-user-router';
import { signInRouter } from './routes/sign-in-router';
import { signOutRouter } from './routes/sign-out-router';
import { signUpRouter } from './routes/sign-up-router';
import cookieSession from 'cookie-session';
// Init Express & Body-Parser
const app: Express = express();
app.set('trust proxy', true);

// Body parser
app.use(express.json());

// Cookie Session
app.use(
  cookieSession({
    signed: false,
    secure: true,
  })
);

// Handlers
app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

// 404 Not Found
app.all('*', async () => {
  throw new NotFoundError();
});

// Global Error Handler
app.use(errorHandler);

// Connect to database
const startupDatabase: () => Promise<void> = async (): Promise<void> => {

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be defined');
  }

  try {
    await mongoose.connect('mongodb://auth-mongo-srv:27017/auth', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('Auth Service - Connected to MongoDB');
  } catch (e) {
    console.log(e);
  }

  // Listen For Requests
  app.listen(3000, () => {
    console.log('Auth Service - Listening on port: 3000');
  });
};

startupDatabase();
