 
import mongoose, { Schema, Document } from "mongoose";

export interface UserModel extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "admin" | "ngo" | "restaurant";
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["admin", "ngo", "restaurant"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User =
  mongoose.models.User || mongoose.model<UserModel>("User", userSchema);

export default User;