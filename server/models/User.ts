import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  googleId?: string;
  email: string;
  password?: string;
  name: string;
  picture?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema = new Schema(
  {
    googleId: { type: String, unique: true, sparse: true }, // sparse: true allows null/undefined to not conflict
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for Google users, required for email users
    name: { type: String, required: true },
    picture: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
