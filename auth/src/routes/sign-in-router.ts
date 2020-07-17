// Import Modules
import express, { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import { BadRequestError } from '../errors/bad-request-error';
import { validateRequest } from '../middleware/validate-request';
import { IUserDoc, USER } from '../models/user-model';
import { PasswordManager } from '../services/password-manager';
import { TokenManager } from '../services/token-manager';

// Init Router
const router: Router = express.Router();

// Handler
router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('You must supply a password'),
  ],
  validateRequest,
  async (req: Request, res: Response): Promise<void> => {
    const {email, password} = req.body;

    // Find the user in the database
    const existingUser: IUserDoc | null = await USER.findOne({email});
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    // Compare passwords
    const doPasswordsMatch: boolean = await PasswordManager.COMPARE(
      existingUser.password,
      password
    );
    if (!doPasswordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    // Sign the JWT token
    req.session = TokenManager.SIGNTOKEN(existingUser);

    // Send back the response
    res.status(200).send(existingUser);
  }
);

// Export named router
export { router as signInRouter };
