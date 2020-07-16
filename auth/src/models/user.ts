import mongoose, { Model, Schema } from "mongoose";

// An interface that describes the properties that are required to create a new user
export interface IUserAttrs {
  email: string;
  password: string;
}

// An interface that describes the properties that a User Document has
export interface IUserDoc extends mongoose.Document {
  email: string;
  password: string;
}

// An interface that describes the properties that a User Model has
export interface IUserModel extends mongoose.Model<IUserDoc>{
  build(attrs: IUserAttrs): IUserDoc;
}

// Create the User schema
const userSchema: Schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// build user function to allow type checking during user creation
userSchema.statics.build = (attributes: IUserAttrs): IUserDoc => new USER(attributes);

// Create the User model
const USER: IUserModel = mongoose.model<IUserDoc, IUserModel>("User", userSchema);

// Export the User model
export { USER };
