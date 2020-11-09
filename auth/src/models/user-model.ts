/* tslint:disable:no-invalid-this */
import {PasswordManager} from '@craterspace/common';
import mongoose, {Document, HookNextFunction, Schema} from 'mongoose';

// An interface that describes the properties that are required to create a new user
export interface IUserAttrs {
    email: string;
    password: string;
}

export interface IUserDoc extends Document {
    email: string;
    password: string;
}

// An interface that describes the properties that a User Model has
export interface IUserModel extends mongoose.Model<IUserDoc> {
    build(attrs: IUserAttrs): IUserDoc;
}

// Create the User schema
const userSchema: Schema = new Schema(
    {
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    {
        toJSON: {
            //tslint:disable-next-line:no-any
            transform(_doc: any, ret: any): void {
                ret.id = ret._id;
                delete ret._id;
                delete ret.password;
            },
            versionKey: false,
        },
    }
);

// build user function to allow type checking during user creation
userSchema.statics.build = (attributes: IUserAttrs): IUserDoc =>
    new UserModel(attributes);

// Hash the user's password and save the hash to the database
userSchema.pre('save', async function (done: HookNextFunction): Promise<void> {
    if (this.isModified('password')) {
        const hashedPassword: string = await PasswordManager.ToHash(
            this.get('password')
        );
        this.set('password', hashedPassword);
    }
    done();
});

// Create the User model
const UserModel: IUserModel = mongoose.model<IUserDoc, IUserModel>(
    'User',
    userSchema
);

// Export the User model
export {UserModel};
