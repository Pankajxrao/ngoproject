
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbconnect";
import NGO from "@/models/NGO";
import Donation from "@/models/Donation";
import { getCurrentUser } from "@/utils/auth";
import { ApiError } from "@/utils/ApiError";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Authenticate admin
    const user = await getCurrentUser();

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (user.role !== "admin") {
      throw new ApiError(403, "Only admins can view all NGOs");
    }

    // Read optional month query parameter (YYYY-MM)
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const match = month?.match(/^(\d{4})-(\d{2})$/);

    if (
      month &&
      (!match ||
        Number(match[2]) < 1 ||
        Number(match[2]) > 12)
    ) {
      throw new ApiError(
        400,
        "Month must use YYYY-MM format, for example 2025-10"
      );
    }

    const now = new Date();
    const year = match ? Number(match[1]) : now.getFullYear();
    const monthNumber = match
      ? Number(match[2]) - 1
      : now.getMonth();

    const startDate = new Date(year, monthNumber, 1);
    const endDate = new Date(year, monthNumber + 1, 1);
    const selectedMonth =
      `${year}-${String(monthNumber + 1).padStart(2, "0")}`;

    // Fetch all NGO profiles, regardless of selected month
    const ngos = await NGO.find()
      .select(
        "ngoName address location verified acceptingDonations capacity userId createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    // Count donations accepted by each NGO during the selected month
    const donationCounts = await Donation.aggregate([
      {
        $match: {
          acceptedAt: {
            $gte: startDate,
            $lt: endDate,
          },
          ngoId: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$ngoId",
          acceptedThisMonth: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map(
      donationCounts.map((item) => [
        String(item._id),
        item.acceptedThisMonth,
      ])
    );

    const result = ngos.map((ngo) => ({
      ...ngo,
      acceptedThisMonth: countMap.get(String(ngo._id)) ?? 0,
    }));

    return NextResponse.json({
      success: true,
      month: selectedMonth,
      count: result.length,
      ngos: result,
    });
  } catch (error) {
    console.error("Admin all NGOs error:", error);

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
        message: "Failed to fetch NGOs",
      },
      { status: 500 }
    );
  }
}
