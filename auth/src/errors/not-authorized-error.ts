import { CustomError } from './custom-error';

export class NotAuthorizedError extends CustomError {
  public statusCode: number = 401;

  constructor() {
    super('Not authorized');
    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }

  public serializeErrors(): { message: string; field?: string }[] {
    return [{message: 'Not authorized'}];
  }
}
