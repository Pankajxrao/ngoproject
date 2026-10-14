
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { dbConnect } from "@/lib/dbconnect";
import NGO from "@/models/NGO";
import { getCurrentUser } from "@/utils/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (user.role !== "restaurant") {
      return NextResponse.json(
        {
          success: false,
          message: "Only restaurants can view NGO details",
        },
        { status: 403 },
      );
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid NGO ID" },
        { status: 400 },
      );
    }

    const ngo = await NGO.findOne({
      _id: id,
      verified: true,
      acceptingDonations: true,
    })
      .select(
        "ngoName address location verified acceptingDonations capacity createdAt updatedAt",
      )
      .lean();

    if (!ngo) {
      return NextResponse.json(
        {
          success: false,
          message: "Verified NGO accepting donations not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "NGO details fetched successfully",
      ngo,
    });
  } catch (error) {
    console.error("Fetch nearby NGO details error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch NGO details",
      },
      { status: 500 },
    );
  }
}
