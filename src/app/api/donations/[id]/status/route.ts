import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { dbConnect } from "@/lib/dbconnect";
import Donation from "@/models/Donation";
import Restaurant from "@/models/Restaurant";
import NGO from "@/models/NGO";
import { getCurrentUser } from "@/utils/auth";
import { ApiError } from "@/utils/ApiError";

type DonationStatus =
  | "picked_up"
  | "completed"
  | "cancelled";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

    const body: unknown = await req.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("status" in body) ||
      typeof body.status !== "string"
    ) {
      throw new ApiError(400, "A valid status is required");
    }

    const requestedStatus = body.status as DonationStatus;

    if (
      !["picked_up", "completed", "cancelled"].includes(
        requestedStatus,
      )
    ) {
      throw new ApiError(400, "Invalid status transition request");
    }

    const donation = await Donation.findById(id);

    if (!donation) {
      throw new ApiError(404, "Donation not found");
    }

    // Only the restaurant that owns the donation or its
    // assigned NGO can update its status.
    if (user.role === "restaurant") {
      const restaurant = await Restaurant.findOne({
        userId: user.userId,
      }).select("_id");

      if (
        !restaurant ||
        donation.restaurantId.toString() !==
          restaurant._id.toString()
      ) {
        throw new ApiError(
          403,
          "You cannot update this donation",
        );
      }

      // Restaurants can cancel only donations not yet accepted.
      if (
        requestedStatus !== "cancelled" ||
        donation.status !== "available"
      ) {
        throw new ApiError(
          400,
          "Restaurants can only cancel available donations",
        );
      }
    } else if (user.role === "ngo") {
      const ngo = await NGO.findOne({
        userId: user.userId,
      }).select("_id");

      if (
        !ngo ||
        !donation.ngoId ||
        donation.ngoId.toString() !== ngo._id.toString()
      ) {
        throw new ApiError(
          403,
          "This donation is not assigned to your NGO",
        );
      }

      if (
        requestedStatus === "picked_up" &&
        donation.status !== "accepted"
      ) {
        throw new ApiError(
          400,
          "Only accepted donations can be marked as picked up",
        );
      }

      if (
        requestedStatus === "completed" &&
        donation.status !== "picked_up"
      ) {
        throw new ApiError(
          400,
          "Only picked-up donations can be completed",
        );
      }

      if (requestedStatus === "cancelled") {
        throw new ApiError(
          403,
          "NGOs cannot cancel donations through this route",
        );
      }
    } else {
      throw new ApiError(
        403,
        "Only the owning restaurant or assigned NGO can update donation status",
      );
    }

    // Prevent updates after expiry or cancellation.
    if (
      ["expired", "cancelled", "completed"].includes(
        donation.status,
      )
    ) {
      throw new ApiError(
        400,
        "This donation can no longer be updated",
      );
    }

    // Update only the allowed fields.
    donation.status = requestedStatus;

    if (requestedStatus === "picked_up") {
      donation.pickedUpAt = new Date();
    }

    await donation.save();

    return NextResponse.json({
      success: true,
      message: `Donation status updated to ${requestedStatus}`,
      donation,
    });
  } catch (error) {
    console.error("Update donation status error:", error);

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
        message: "Failed to update donation status",
      },
      { status: 500 },
    );
  }
}

