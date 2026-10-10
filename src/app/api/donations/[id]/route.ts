import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { dbConnect } from "@/lib/dbconnect";
import Donation from "@/models/Donation";
import Restaurant from "@/models/Restaurant";
import NGO from "@/models/NGO";
import { getCurrentUser } from "@/utils/auth";
import { ApiError } from "@/utils/ApiError";
import { donationSchema } from "@/schemas/donationSchema";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function handleError(error: unknown, message: string) {
  console.error(message, error);

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
      message,
    },
    { status: 500 },
  );
}

async function getAccessibleDonation(
  id: string,
  user: { userId: string; role: string },
) {
  if (user.role === "admin") {
    return Donation.findById(id);
  }

  if (user.role === "restaurant") {
    const restaurant = await Restaurant.findOne({
      userId: user.userId,
    }).select("_id");

    if (!restaurant) {
      throw new ApiError(404, "Restaurant profile not found");
    }

    return Donation.findOne({
      _id: id,
      restaurantId: restaurant._id,
    });
  }

  if (user.role === "ngo") {
    const ngo = await NGO.findOne({
      userId: user.userId,
    }).select("_id");

    if (!ngo) {
      throw new ApiError(404, "NGO profile not found");
    }

    return Donation.findOne({
      _id: id,
      $or: [
        { status: "available" },
        { ngoId: ngo._id },
      ],
    });
  }

  throw new ApiError(403, "Access denied");
}

// GET: Fetch one donation
export async function GET(
  _req: NextRequest,
  { params }: RouteContext,
) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid donation ID");
    }

    const donation = await getAccessibleDonation(id, user);

    if (!donation) {
      throw new ApiError(
        404,
        "Donation not found or access denied",
      );
    }

    return NextResponse.json({
      success: true,
      donation,
    });
  } catch (error) {
    return handleError(error, "Failed to fetch donation");
  }
}

// PATCH: Update donation details while available
export async function PATCH(
  req: NextRequest,
  { params }: RouteContext,
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
        "Only restaurants can update donation details",
      );
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid donation ID");
    }

    const restaurant = await Restaurant.findOne({
      userId: user.userId,
    }).select("_id");

    if (!restaurant) {
      throw new ApiError(404, "Restaurant profile not found");
    }

    const body: unknown = await req.json();

    // Validate the submitted fields using your existing schema.
    const parsed = donationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const donation = await Donation.findOneAndUpdate(
      {
        _id: id,
        restaurantId: restaurant._id,
        status: "available",
      },
      {
        $set: parsed.data,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!donation) {
      throw new ApiError(
        404,
        "Available donation not found for this restaurant",
      );
    }

    return NextResponse.json({
      success: true,
      message: "Donation updated successfully",
      donation,
    });
  } catch (error) {
    return handleError(error, "Failed to update donation");
  }
}

// DELETE: Delete an available donation
export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext,
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
        "Only restaurants can delete their donations",
      );
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid donation ID");
    }

    const restaurant = await Restaurant.findOne({
      userId: user.userId,
    }).select("_id");

    if (!restaurant) {
      throw new ApiError(404, "Restaurant profile not found");
    }

    const donation = await Donation.findOneAndDelete({
      _id: id,
      restaurantId: restaurant._id,
      status: "available",
    });

    if (!donation) {
      throw new ApiError(
        404,
        "Available donation not found for this restaurant",
      );
    }

    return NextResponse.json({
      success: true,
      message: "Donation deleted successfully",
    });
  } catch (error) {
    return handleError(error, "Failed to delete donation");
  }
}
 