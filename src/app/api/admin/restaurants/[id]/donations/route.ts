
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbconnect";
import Restaurant from "@/models/Restaurant";
import Donation from "@/models/Donation";
import NGO from "@/models/NGO";
import { getCurrentUser } from "@/utils/auth";
import { ApiError } from "@/utils/ApiError";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (user.role !== "admin") {
      throw new ApiError(
        403,
        "Only admins can view restaurant donation history"
      );
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid restaurant ID");
    }

    const restaurant = await Restaurant.findById(id)
      .select("restaurantName address location verified donating");

    if (!restaurant) {
      throw new ApiError(404, "Restaurant not found");
    }

    const month = req.nextUrl.searchParams.get("month");
    const match = month?.match(/^(\d{4})-(\d{2})$/);

    if (
      month &&
      (!match ||
        Number(match[2]) < 1 ||
        Number(match[2]) > 12)
    ) {
      throw new ApiError(
        400,
        "Month must use YYYY-MM format"
      );
    }

    const year = match
      ? Number(match[1])
      : new Date().getFullYear();

    const monthNumber = match
      ? Number(match[2]) - 1
      : new Date().getMonth();

    const startDate = new Date(year, monthNumber, 1);
    const endDate = new Date(year, monthNumber + 1, 1);

    const donations = await Donation.find({
      restaurantId: restaurant._id,
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    })
      .sort({ createdAt: -1 })
      .lean();

    const ngoIds = [
      ...new Set(
        donations
          .filter((donation) => donation.ngoId)
          .map((donation) => String(donation.ngoId))
      ),
    ];

    const ngos = await NGO.find({
      _id: { $in: ngoIds },
    })
      .select("ngoName address")
      .lean();

    const ngoMap = new Map(
      ngos.map((ngo) => [String(ngo._id), ngo])
    );

    const result = donations.map((donation) => {
      const ngo = donation.ngoId
        ? ngoMap.get(String(donation.ngoId))
        : undefined;

      return {
        ...donation,
        ngo: ngo
          ? {
              id: ngo._id,
              name: ngo.ngoName,
              address: ngo.address,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      restaurant: {
        id: restaurant._id,
        name: restaurant.restaurantName,
        address: restaurant.address,
        verified: restaurant.verified,
        donating: restaurant.donating,
      },
      month: `${year}-${String(
        monthNumber + 1
      ).padStart(2, "0")}`,
      count: result.length,
      donations: result,
    });
  } catch (error) {
    console.error(
      "Admin restaurant donation history error:",
      error
    );

    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          errors: error.errors,
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch restaurant donations",
      },
      { status: 500 }
    );
  }
}
