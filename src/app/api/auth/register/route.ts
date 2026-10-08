import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

import User from "@/models/User";
import { ApiResponse } from "@/utils/ApiResponse";
import { ApiError } from "@/utils/ApiError";
import { signUpSchema } from "@/schemas/signUpSchema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = signUpSchema.safeParse(body);

    if (!result.success) {
      throw new ApiError(400, result.error.issues[0].message);
    }

    const { name, email, phone, password, role } = result.data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new ApiError(409, "User already exists with this email");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    const createdUser = await User.findById(user._id).select("-password");

    return NextResponse.json(
      new ApiResponse(201, createdUser, "User registered successfully"),
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong creating user",
      },
      { status: 500 },
    );
  }
}
