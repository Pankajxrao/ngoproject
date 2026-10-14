import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbconnect";
import Restaurant from "@/models/Restaurant";
import { getCurrentUser } from "@/utils/auth";

export async function GET() {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in." },
        { status: 401 }
      );
    }

    const restaurant = await Restaurant.findOne({
      userId: user.userId,
    }).lean();

    // No profile yet is a valid result, not a server error.
    return NextResponse.json({
      success: true,
      restaurant: restaurant ?? null,
    });
  } catch (error) {
    console.error("LOAD MY RESTAURANT ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Could not load your restaurant profile." },
      { status: 500 }
    );
  }
}
