// Import Modules
import {
    BadRequestError,
    PasswordManager,
    TokenManager,
    validateRequest,
} from '@craterspace/common';
import express, {Request, Response, Router} from 'express';

import {IUserDoc, UserModel} from '../models/user-model';
import {body} from 'express-validator';

// Init Router
const router: Router = express.Router();

// Handler
router.post(
    '/api/users/signin',
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('You must supply a password'),
    ],
    validateRequest,
    async (req: Request, res: Response): Promise<void> => {
        const {email, password} = req.body;

        // Find the user in the database
        const existingUser: IUserDoc | null = await UserModel.findOne({email});
        if (!existingUser) {
            throw new BadRequestError('Invalid credentials');
        }

        // Compare passwords
        const doPasswordsMatch: boolean = await PasswordManager.Compare(
            existingUser.password,
            password
        );
        if (!doPasswordsMatch) {
            throw new BadRequestError('Invalid credentials');
        }

        // Sign the JWT token
        req.session = TokenManager.SignToken(existingUser);

        // Send back the response
        res.status(200)
           .send(existingUser);
    }
);

// Export named router
export {router as signInRouter};
