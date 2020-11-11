/* tslint:disable:no-implicit-dependencies no-backbone-get-set-outside-model */
//@ts-ignore
import supertest, { Response } from "supertest";
import { app } from "../../app";

const { currentUserRoute, validEmail, signUp } = global;

describe("Current User Router", (): void => {
  it('should respond with details about the currently logged in user', async (): Promise<void> => {
    const jwtCookie: string[] = await signUp();

    const currentUserResponse: Response = await supertest(app)
      .get(currentUserRoute)
      .set('Cookie', jwtCookie)
      .send()
      .expect(200);

    expect(currentUserResponse.body.currentUser.email).toEqual(validEmail);
  });

  it('should respond with null if the user is not authenticated', async (): Promise<void> => {
    const currentUserResponse: Response = await supertest(app)
      .get(currentUserRoute)
      .send()
      .expect(200);

    expect(currentUserResponse.body.currentUser).toBeNull();
  });
});
