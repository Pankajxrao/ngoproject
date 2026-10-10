import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbconnect";
import { getCurrentUser } from "@/utils/auth";
import NGO from "@/models/NGO";

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
        { success: false, message: "Only admins can verify NGOs" },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid NGO ID" },
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

    const ngo = await NGO.findByIdAndUpdate(
      id,
      { $set: { verified: body.verified } },
      { new: true, runValidators: true }
    ).select("ngoName address verified updatedAt");

    if (!ngo) {
      return NextResponse.json(
        { success: false, message: "NGO not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: body.verified
        ? "NGO verified successfully"
        : "NGO verification revoked successfully",
      ngo,
    });
  } catch (error) {
    console.error("Verify NGO error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update NGO verification" },
      { status: 500 }
    );
  }
}
 