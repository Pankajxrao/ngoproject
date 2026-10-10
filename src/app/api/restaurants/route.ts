import { ApiError } from "@/utils/ApiError";


import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbconnect";
import { getCurrentUser } from "@/utils/auth";
import Restaurant from "@/models/Restaurant";
import { restaurantSchema } from "@/schemas/restaurantSchema";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (user.role !== "restaurant") {
      return NextResponse.json(
        { message: "Only restaurant users can create a restaurant profile" },
        { status: 403 },
      );
    }

    const existingRestaurant = await Restaurant.findOne({
      userId: user.userId,
    });

    if (existingRestaurant) {
      return NextResponse.json(
        { message: "Restaurant profile already exists" },
        { status: 409 },
      );
    }

    const body: unknown = await req.json();
    const parsed = restaurantSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { restaurantName, address, latitude, longitude } = parsed.data;

    const restaurant = await Restaurant.create({
      userId: user.userId,
      restaurantName,
      address,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      verified: false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Restaurant profile created successfully",
        restaurant,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create restaurant error:", error);

    return NextResponse.json(
      { message: "Failed to create restaurant profile" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await dbConnect();

    const user = getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const restaurants = await Restaurant.find()
      .select("restaurantName address location verified createdAt")
      .sort({ createdAt: -1 })
      .lean();

    if (restaurants.length === 0)
      throw new ApiError(404, "No restaurants found");

    return NextResponse.json({
      success: true,
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    console.error("Fetch restaurants error:", error);
    return NextResponse.json(
      { message: "Failed to fetch restaurants" },
      { status: 500 },
    );
  }
}
