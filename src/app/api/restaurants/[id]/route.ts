import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbconnect";
import { getCurrentUser } from "@/utils/auth";
import Restaurant from "@/models/Restaurant";
import { restaurantSchema } from "@/schemas/restaurantSchema";
import Donation from "@/models/Donation";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid restaurant ID" },
        { status: 400 },
      );
    }

    const restaurant = await Restaurant.findById(id)
      .select("restaurantName address location verified createdAt updatedAt")
      .lean();

    if (!restaurant) {
      return NextResponse.json(
        { message: "Restaurant not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      restaurant,
    });
  } catch (error) {
    console.error("Fetch restaurant error:", error);

    return NextResponse.json(
      { message: "Failed to fetch restaurant" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid restaurant ID" },
        { status: 400 },
      );
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return NextResponse.json(
        { message: "Restaurant not found" },
        { status: 404 },
      );
    }

    if (restaurant.userId.toString() !== user.userId && user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
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

const locationChanged =
  restaurant.address !== address ||
  restaurant.location.coordinates[0] !== longitude ||
  restaurant.location.coordinates[1] !== latitude;

restaurant.restaurantName = restaurantName;
restaurant.address = address;
restaurant.location = {
  type: "Point",
  coordinates: [longitude, latitude],
};

 if (locationChanged) {
  restaurant.verified = false;
}

await restaurant.save();

    return NextResponse.json({
      success: true,
      message: "Restaurant updated successfully",
      restaurant: {
        _id: restaurant._id,
        restaurantName: restaurant.restaurantName,
        address: restaurant.address,
        location: restaurant.location,
        verified: restaurant.verified,
        createdAt: restaurant.createdAt,
        updatedAt: restaurant.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update restaurant error:", error);

    return NextResponse.json(
      { message: "Failed to update restaurant" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid restaurant ID" },
        { status: 400 },
      );
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return NextResponse.json(
        { message: "Restaurant not found" },
        { status: 404 },
      );
    }

    if (restaurant.userId.toString() !== user.userId && user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

const activeDonations = await Donation.exists({
  restaurantId: restaurant._id,
  status: { $in: ["available", "accepted", "picked_up"] },
});

if (activeDonations) {
  return NextResponse.json(
    {
      success: false,
      message:
        "Cannot delete this restaurant because it has active donations. Please complete or cancel them first.",
    },
    { status: 409 },
  );
}

await restaurant.deleteOne();
    return NextResponse.json({
      success: true,
      message: "Restaurant deleted successfully",
    });
  } catch (error) {
    console.error("Delete restaurant error:", error);

    return NextResponse.json(
      { message: "Failed to delete restaurant" },
      { status: 500 },
    );
  }
}
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (user.role !== "restaurant") {
      return NextResponse.json(
        {
          success: false,
          message: "Only restaurants can update donation availability",
        },
        { status: 403 },
      );
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid restaurant ID" },
        { status: 400 },
      );
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return NextResponse.json(
        { success: false, message: "Restaurant not found" },
        { status: 404 },
      );
    }

    if (restaurant.userId.toString() !== user.userId) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    if (!restaurant.verified) {
      return NextResponse.json(
        {
          success: false,
          message: "Your restaurant must be verified first",
        },
        { status: 403 },
      );
    }

    const body: unknown = await req.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("donating" in body) ||
      typeof body.donating !== "boolean"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please provide "donating" as true or false',
        },
        { status: 400 },
      );
    }

    restaurant.donating = body.donating;
    await restaurant.save();

    return NextResponse.json({
      success: true,
      message: body.donating
        ? "Restaurant is now marked as donating"
        : "Restaurant is no longer marked as donating",
      donating: restaurant.donating,
    });
  } catch (error) {
    console.error("Update donation availability error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update donation availability",
      },
      { status: 500 },
    );
  }
}
