import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbconnect";
import { getCurrentUser } from "@/utils/auth";
import Restaurant from "@/models/Restaurant";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Only admins can verify restaurants" },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid restaurant ID" },
        { status: 400 }
      );
    }

    const body: unknown = await req.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("verified" in body) ||
      typeof body.verified !== "boolean"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Provide verified as true or false",
        },
        { status: 400 }
      );
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      { $set: { verified: body.verified } },
      { new: true, runValidators: true }
    ).select("restaurantName address verified updatedAt");

    if (!restaurant) {
      return NextResponse.json(
        { success: false, message: "Restaurant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: body.verified
        ? "Restaurant verified successfully"
        : "Restaurant verification revoked successfully",
      restaurant,
    });
  } catch (error) {
    console.error("Verify restaurant error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update restaurant verification" },
      { status: 500 }
    );
  }
}
