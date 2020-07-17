import { ValidationError } from 'express-validator';
import { CustomError } from './custom-error';

export class RequestValidationError extends CustomError {
  public statusCode: number = 400;

  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super('Invalid request parameters');
    this.errors = errors;
    // If extending a class that is build into the language
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  public serializeErrors(): { field: '_error' | string; message: any }[] {
    return this.errors.map((err) => {
      return {message: err.msg, field: err.param};
    });
  }
}
