/* tslint:disable:no-implicit-dependencies no-backbone-get-set-outside-model */
//@ts-ignore
import supertest, { Response } from "supertest";
import { app } from "../../app";

const {
  signInRoute,
  validEmail,
  validPassword,
  invalidEmail,
  invalidPassword,
  signUp,
} = global;

describe("Sign In Router", (): void => {
  it("should fail when a provided email does not exist in the database", async () => {
    return supertest(app)
      .post(signInRoute)
      .send({ email: validEmail, password: validPassword })
      .expect(400);
  });

  it("should respond with a jwt when given valid credentials", async () => {
    await signUp();

    const response: Response = await supertest(app)
      .post(signInRoute)
      .send({ email: validEmail, password: validPassword })
      .expect(200);

    expect(response.get("Set-Cookie")).toBeDefined();
  });

  it("should fail when an incorrect email is supplied", async () => {
    await signUp();

    return supertest(app)
      .post(signInRoute)
      .send({ email: invalidEmail, password: validPassword })
      .expect(400);
  });

  it("should fail when an incorrect password is supplied", async () => {
    await signUp();

    return supertest(app)
      .post(signInRoute)
      .send({ email: validEmail, password: invalidPassword })
      .expect(400);
  });

  it("should fail when no email or password is supplied", async () => {
    await signUp();

    await supertest(app)
      .post(signInRoute)
      .send({ email: validEmail })
      .expect(400);

    return supertest(app)
      .post(signInRoute)
      .send({ password: validPassword })
      .expect(400);
  });
});
