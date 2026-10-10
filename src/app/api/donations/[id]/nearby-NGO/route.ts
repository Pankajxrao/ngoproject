 import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { dbConnect } from "@/lib/dbconnect";
import Donation from "@/models/Donation";
import Restaurant from "@/models/Restaurant";
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
        "Only restaurants can find nearby NGOs",
      );
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid donation ID");
    }

    const restaurant = await Restaurant.findOne({
      userId: user.userId,
    }).select("_id location verified");

    if (!restaurant) {
      throw new ApiError(404, "Restaurant profile not found");
    }

    if (!restaurant.verified) {
      throw new ApiError(
        403,
        "Your restaurant must be verified",
      );
    }

    const donation = await Donation.findOne({
      _id: id,
      restaurantId: restaurant._id,
      status: "available",
    }).select("_id");

    if (!donation) {
      throw new ApiError(
        404,
        "Available donation not found for this restaurant",
      );
    }

    const coordinates = restaurant.location?.coordinates;

    if (
      !coordinates ||
      coordinates.length !== 2 ||
      !coordinates.every(Number.isFinite)
    ) {
      throw new ApiError(
        400,
        "Restaurant location is invalid or missing",
      );
    }

    const ngos = await NGO.find({
      verified: true,
      acceptingDonations: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates,
          },
          $maxDistance: 5000,
        },
      },
    })
      .select("ngoName address location capacity")
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      message: "Nearby NGOs fetched successfully",
      radiusKm: 5,
      count: ngos.length,
      ngos,
    });
  } catch (error) {
    console.error("Nearby NGOs error:", error);

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
        message: "Failed to fetch nearby NGOs",
      },
      { status: 500 },
    );
  }
}
 