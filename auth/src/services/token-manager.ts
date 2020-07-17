/* tslint:disable:no-non-null-assertion */
import jsonwebtoken from 'jsonwebtoken';
import { IUserDoc } from '../models/user-model';

export interface IUserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    //tslint:disable-next-line:interface-name
    interface Request {
      currentUser?: IUserPayload
    }
  }
}

export class TokenManager {
  public static SIGNTOKEN = (user: IUserDoc): { jwt: string } => {
    // Generate JSON Web Token
    const {JWT_SECRET} = process.env;

    return {
      jwt: jsonwebtoken.sign(
        {
          id: user.id,
          email: user.email,
        },
        JWT_SECRET!
      ),
    };
  };

  public static VERIFYTOKEN = (token: string): IUserPayload => {
    const {JWT_SECRET} = process.env;
    return jsonwebtoken.verify(token, JWT_SECRET!) as IUserPayload;
  };
}
