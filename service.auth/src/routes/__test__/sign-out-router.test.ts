/* tslint:disable:no-implicit-dependencies no-backbone-get-set-outside-model */
//@ts-ignore
import supertest, { Response } from 'supertest';
import { app } from '../../app';

const {
  signOutRoute,
  signUp,
} = global;

describe('Sign Out Router', (): void => {
  it('should clear the jwt cookie after signing out', async (): Promise<void> => {
    await signUp();

    const response: Response = await supertest(app)
      .post(signOutRoute)
      .expect(200);

    expect(response.get('Set-Cookie')[0]).toEqual(
      'express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
    );
  });
});
