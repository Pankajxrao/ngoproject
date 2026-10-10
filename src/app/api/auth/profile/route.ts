
import { NextResponse } from "next/server";
import User from "@/models/User";
import { dbConnect } from "@/lib/dbconnect";
import { getCurrentUser } from "@/utils/auth";
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";

export async function GET() {
  try {

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new ApiError(401, "Unauthorized. Please log in.");
    }

    await dbConnect();

    const user = await User.findById(currentUser.userId).select("-password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return NextResponse.json(
      new ApiResponse(200, user, "Profile fetched successfully"),
      { status: 200 }
    );
  } catch (error) {
    console.error("PROFILE ERROR:", error);

    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, message: "Something went wrong while fetching profile" },
      { status: 500 }
    );
  }
}