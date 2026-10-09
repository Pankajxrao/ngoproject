import User from "@/models/User";
import { loginSchema, signUpSchema } from "@/schemas/signUpSchema";
import { ApiError } from "@/utils/ApiError";
 import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { ApiResponse } from "@/utils/ApiResponse";
import { generateToken } from "@/utils/jwt";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/dbconnect";

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const body = await req.json();

    const result = loginSchema.safeParse(body);

    if (!result.success) {
      throw new ApiError(400, result.error.issues[0].message);
    }

    const { email, password } = result.data;

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new ApiError(401, "Invalid email or password");
    }
   const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
    });

    const cookieStore = await cookies();

    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    const loggedInUser = await User
      .findById(user._id)
      .select("-password");

    return NextResponse.json(
      new ApiResponse(
        200,
        loggedInUser,
        "Login successful"
      ),
      { status: 200 }
    );

  } catch (error) {
 console.error("LOGIN ERROR:", error);
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong during login",
      },
      { status: 500 }
    );
  }
}