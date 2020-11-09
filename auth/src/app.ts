import 'express-async-errors';

// Import Modules
import { NotFoundError, errorHandler } from '@craterspace/common';
import express, { Express } from 'express';

import cookieSession from 'cookie-session';
import { currentUserRouter } from './routes/current-user-router';
import { signInRouter } from './routes/sign-in-router';
import { signOutRouter } from './routes/sign-out-router';
import { signUpRouter } from './routes/sign-up-router';

// Init Express & Body-Parser
const app: Express = express();
app.set('trust proxy', true);

// Body parser
app.use(express.json());

// Cookie Session
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
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

// Export app module
export { app };
