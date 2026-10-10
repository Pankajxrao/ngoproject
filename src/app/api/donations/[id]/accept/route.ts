import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbconnect";
import Donation from "@/models/Donation";
import NGO from "@/models/NGO";
import { getCurrentUser } from "@/utils/auth";
import { ApiError } from "@/utils/ApiError";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();

    // 1. Authenticate the user
    const user = await getCurrentUser();

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    // 2. Only NGOs can accept donations
    if (user.role !== "ngo") {
      throw new ApiError(403, "Only NGO accounts can accept donations");
    }

    // 3. Validate donation ID
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid donation ID");
    }

    // 4. Find the NGO profile belonging to this user
    const ngo = await NGO.findOne({
      userId: user.userId,
    });

    if (!ngo) {
      throw new ApiError(404, "NGO profile not found");
    }

    if (!ngo.verified) {
      throw new ApiError(
        403,
        "Your NGO must be verified before accepting donations",
      );
    }

    // 5. Atomically accept only an available donation
    const donation = await Donation.findOneAndUpdate(
      {
        _id: id,
        status: "available",
      },
      {
        $set: {
          status: "accepted",
          ngoId: ngo._id,
          acceptedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!donation) {
      const existingDonation = await Donation.exists({ _id: id });

      if (!existingDonation) {
        throw new ApiError(404, "Donation not found");
      }

      throw new ApiError(409, "This donation is no longer available");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Donation accepted successfully",
        donation,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Accept donation error:", error);

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
        message: "Failed to accept donation",
      },
      { status: 500 },
    );
  }
}
