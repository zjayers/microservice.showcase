// Import Modules
import express, { Request, Response, Router } from "express";
import { body, validationResult } from "express-validator";
import { RequestValidationError } from "../errors/request-validation-error";
import { IUserDoc, USER } from '../models/user';

// Init Router
const router: Router = express.Router();

// Handler
router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 & 20 characters"),
  ],
  async (req: Request, res: Response): Promise<Response> => {
    // Pull object from the validation result
    const { array, isEmpty } = validationResult(req);

    // If an error occurred
    if (!isEmpty()) {
      throw new RequestValidationError(array());
    }

    // If all went well pull the 'email' and 'password' from the request body
    const { email, password } = req.body;

    // Check if email exists in the database
    const existingUser: IUserDoc | null = await USER.findOne({email});

    if (existingUser) {
      console.log('Email in use');

      return res.send({});
    }

    // Create the new user
    const newUser: IUserDoc = USER.build({
      email, password
    })

    // Save the user to the database
    await newUser.save();

    // Notify the user of the creation
    return res.status(201).send(newUser);
  }
);

// Export named router
export { router as signUpRouter };
