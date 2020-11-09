// Import Modules
import {
    BadRequestError,
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
    '/api/users/signup',
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .isLength({min: 4, max: 20})
            .withMessage('Password must be between 4 & 20 characters'),
    ],
    validateRequest,
    async (req: Request, res: Response): Promise<void> => {
        // If all went well pull the 'email' and 'password' from the request body
        const {email, password} = req.body;

        // Check if email exists in the database
        const existingUser: IUserDoc | null = await UserModel.findOne({email});

        // If user exists - return a UserModel exists error
        if (existingUser) {
            throw new BadRequestError('Email already in use');
        }

        // Create the new user
        const newUser: IUserDoc = UserModel.build({
                                                      email,
                                                      password,
                                                  });

        // Save the user to the database
        await newUser.save();

        // Generate JSON Web Token
        req.session = TokenManager.SignToken(newUser);

        // Notify the user of the creation
        res.status(201)
           .send(newUser);
    }
);

// Export named router
export {router as signUpRouter};
