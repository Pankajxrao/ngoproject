
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbconnect";
import Restaurant from "@/models/Restaurant";
import Donation from "@/models/Donation";
import { getCurrentUser } from "@/utils/auth";
import { ApiError } from "@/utils/ApiError";

export async function GET() {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (user.role !== "admin") {
      throw new ApiError(
        403,
        "Only admins can view all restaurants"
      );
    }

    const now = new Date();
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );
    const endDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    );

    const restaurants = await Restaurant.find()
      .select(
        "restaurantName address location verified donating userId createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    const donationCounts = await Donation.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: "$restaurantId",
          donationsThisMonth: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map(
      donationCounts.map((item) => [
        String(item._id),
        item.donationsThisMonth,
      ])
    );

    const result = restaurants.map((restaurant) => ({
      ...restaurant,
      donationsThisMonth:
        countMap.get(String(restaurant._id)) ?? 0,
    }));

    return NextResponse.json({
      success: true,
      month: `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}`,
      count: result.length,
      restaurants: result,
    });
  } catch (error) {
    console.error("Admin all restaurants error:", error);

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
        message: "Failed to fetch restaurants",
      },
      { status: 500 }
    );
  }
}
