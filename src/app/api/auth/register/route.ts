import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

import User from "@/models/User";
import { ApiResponse } from "@/utils/ApiResponse";
import { ApiError } from "@/utils/ApiError";
import { signUpSchema } from "@/schemas/signUpSchema";
import {dbConnect} from "@/lib/dbconnect";

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    console.log("1. Register route started");

    const body = await req.json();
    console.log("2. Request body received");

    const result = signUpSchema.safeParse(body);

    if (!result.success) {
      console.log("3. Zod validation failed:", result.error.issues);
      throw new ApiError(400, result.error.issues[0].message);
    }

    console.log("3. Zod validation passed");

    const { name, email, phone, password, role } = result.data;

    console.log("4. Checking existing user");

    const existingUser = await User.findOne({ email });

    console.log("5. Existing user query finished");

    if (existingUser) {
      throw new ApiError(409, "User already exists with this email");
    }

    console.log("6. Hashing password");

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("7. Creating user");

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    console.log("8. User created:", user._id.toString());

    const createdUser = await User.findById(user._id).select("-password");

    console.log("9. Registration completed");

    return NextResponse.json(
      new ApiResponse(201, createdUser, "User registered successfully"),
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}