import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../errors/custom-error';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response {
  if (error instanceof CustomError) {
    return res
      .status(error.statusCode)
      .send({errors: error.serializeErrors()});
  }

  // Global catch error handler
  return res
    .status(400)
    .send({errors: [{message: 'Something went wrong', error: error.message, stack: error.stack}]});
}
