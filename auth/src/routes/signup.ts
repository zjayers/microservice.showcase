/* Import Modules */
import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { RequestValidationError } from "../errors/request-validation-error";
import { DatabaseConnectionError } from "../errors/database-connection-error";

/* Init Router */
const router = express.Router();

/* Handler */
router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 & 20 characters"),
  ],
  async (req: Request, res: Response) => {
    /* Pull object from the validation result */
    const errors = validationResult(req);

    /* If an error occurred */
    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }

    /* If all went well pull the 'email' and 'password' from the request body */
    const { email, password } = req.body;
    throw new DatabaseConnectionError();

    res.send("Hi there!");
  }
);

/* Export named router */
export { router as signUpRouter };
