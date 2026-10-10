
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbconnect";
import Donation from "@/models/Donation";
import NGO from "@/models/NGO";
import Restaurant from "@/models/Restaurant";
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
      throw new ApiError(403, "Only admins can view NGO donation history");
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid NGO ID");
    }

    const ngo = await NGO.findById(id).select("ngoName");

    if (!ngo) {
      throw new ApiError(404, "NGO not found");
    }

    // Default to the current month; optionally accept ?month=YYYY-MM
    const month = req.nextUrl.searchParams.get("month");

    const match = month?.match(/^(\d{4})-(\d{2})$/);

    if (month && (!match || Number(match[2]) < 1 || Number(match[2]) > 12)) {
      throw new ApiError(400, "Month must use YYYY-MM format");
    }

    const year = match ? Number(match[1]) : new Date().getFullYear();
    const monthNumber = match ? Number(match[2]) - 1 : new Date().getMonth();

    const startDate = new Date(year, monthNumber, 1);
    const endDate = new Date(year, monthNumber + 1, 1);

    const donations = await Donation.find({
      ngoId: ngo._id,
      acceptedAt: {
        $gte: startDate,
        $lt: endDate,
      },
    })
      .sort({ acceptedAt: -1 })
      .lean();

    const restaurantIds = [
      ...new Set(donations.map((d) => String(d.restaurantId))),
    ];

    const restaurants = await Restaurant.find({
      _id: { $in: restaurantIds },
    })
      .select("restaurantName address")
      .lean();

    const restaurantMap = new Map(
      restaurants.map((r) => [String(r._id), r])
    );

    const results = donations.map((donation) => {
      const restaurant = restaurantMap.get(String(donation.restaurantId));

      return {
        ...donation,
        restaurant: restaurant
          ? {
              name: restaurant.restaurantName,
              address: restaurant.address,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      ngo: {
        id: ngo._id,
        name: ngo.ngoName,
      },
      month: `${year}-${String(monthNumber + 1).padStart(2, "0")}`,
      count: results.length,
      donations: results,
    });
  } catch (error) {
    console.error("Admin NGO donation history error:", error);

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
        message: "Failed to fetch NGO donation history",
      },
      { status: 500 }
    );
  }
}
