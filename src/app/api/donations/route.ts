import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbconnect";
import Donation from "@/models/Donation";
import Restaurant from "@/models/Restaurant";
import NGO from "@/models/NGO";
import { getCurrentUser } from "@/utils/auth";
import { ApiError } from "@/utils/ApiError";
import { donationSchema } from "@/schemas/donationSchema";

export async function GET() {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    let filter = {};

    if (user.role === "restaurant") {
      const restaurant = await Restaurant.findOne({
        userId: user.userId,
      }).select("_id");

      if (!restaurant) {
        throw new ApiError(404, "Restaurant profile not found");
      }

      filter = {
        restaurantId: restaurant._id,
      };
    } else if (user.role === "ngo") {
      const ngo = await NGO.findOne({
        userId: user.userId,
      }).select("_id");

      if (!ngo) {
        throw new ApiError(404, "NGO profile not found");
      }

      filter = {
        $or: [
          { status: "available" },
          { ngoId: ngo._id },
        ],
      };
    } else if (user.role !== "admin") {
      throw new ApiError(403, "Access denied");
    }

    const donations = await Donation.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    console.error("Fetch donations error:", error);

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
        message: "Failed to fetch donations",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (user.role !== "restaurant") {
      throw new ApiError(
        403,
        "Only restaurant accounts can create donations",
      );
    }

    const body: unknown = await req.json();

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

    const restaurant = await Restaurant.findOne({
      userId: user.userId,
    });

    if (!restaurant) {
      throw new ApiError(404, "Restaurant profile not found");
    }

    if (!restaurant.verified) {
      throw new ApiError(
        403,
        "Your restaurant must be verified to create donations",
      );
    }

    const donation = await Donation.create({
      ...parsed.data,
      restaurantId: restaurant._id,
      status: "available",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Donation created successfully",
        donation,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create donation error:", error);

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
        message: "Failed to create donation",
      },
      { status: 500 },
    );
  }
}
