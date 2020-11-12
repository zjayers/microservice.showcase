import { app } from "../../app";
/* tslint:disable:no-implicit-dependencies no-backbone-get-set-outside-model */
//@ts-ignore
import supertest from "supertest";

const {
  signUpRoute,
  validEmail,
  validPassword,
  invalidEmail,
  invalidPassword,
  signUp,
} = global;

describe("Sign Up Router", () => {
  it("should return a 201 on successfully signing up a user", async () => {
    return signUp();
  });

  it("should return a status code of 400 if an invalid email is sent", async () => {
    return supertest(app)
      .post(signUpRoute)
      .send({
        email: invalidEmail,
        password: validPassword,
      })
      .expect(400);
  });

  it("should return a status code of 400 if an invalid password is sent", async () => {
    return supertest(app)
      .post(signUpRoute)
      .send({
        email: validEmail,
        password: invalidPassword,
      })
      .expect(400);
  });

  it("should return a status code of 400 if email or password are missing", async () => {
    await supertest(app)
      .post(signUpRoute)
      .send({
        email: validEmail,
      })
      .expect(400);

    return supertest(app)
      .post(signUpRoute)
      .send({
        password: validPassword,
      })
      .expect(400);
  });

  it("should not allow signing up with a duplicate email", async () => {
    await signUp();

    await supertest(app)
      .post(signUpRoute)
      .send({
        email: validEmail,
        password: validPassword,
      })
      .expect(400);
  });

  it("should set a jwt cookie after successful sign up", async () => {
    const jwtCookie: string[] = await signUp();

    expect(jwtCookie).toBeDefined();
  });
});
