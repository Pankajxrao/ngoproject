
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbconnect";
import Restaurant from "@/models/Restaurant";
import { getCurrentUser } from "@/utils/auth";

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in." },
        { status: 401 }
      );
    }

    await dbConnect();

    const restaurant = await Restaurant.findOne({
      userId: user.userId,
    }).lean();

    return NextResponse.json({
      success: true,
      restaurant: restaurant ?? null,
    });
  } catch (error) {
    console.error("LOAD MY RESTAURANT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not load your restaurant profile.",
      },
      { status: 500 }
    );
  }
}
