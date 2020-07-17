import { CustomError } from './custom-error';

export class DatabaseConnectionError extends CustomError {
  public statusCode: number = 500;
  public reason: string = 'Error connecting to database';

  constructor() {
    super('Error connection to database');
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  public serializeErrors(): { message: string }[] {
    return [{message: this.reason}];
  }
}
