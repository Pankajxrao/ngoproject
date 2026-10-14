import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { dbConnect } from "@/lib/dbconnect";
import NGO from "@/models/NGO";
import { getCurrentUser } from "@/utils/auth";
import { ApiError } from "@/utils/ApiError";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (user.role !== "restaurant") {
      throw new ApiError(
        403,
        "Only restaurants can view NGO details",
      );
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid NGO ID");
    }

    const ngo = await NGO.findOne({
      _id: id,
      verified: true,
      acceptingDonations: true,
    })
      .select("-__v")
      .lean();

    if (!ngo) {
      throw new ApiError(
        404,
        "Verified NGO accepting donations not found",
      );
    }

    return NextResponse.json({
      success: true,
      message: "NGO details fetched successfully",
      ngo,
    });
  } catch (error) {
    console.error("NGO details error:", error);

    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          errors: error.errors,
        },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch NGO details",
      },
      { status: 500 },
    );
  }
}
