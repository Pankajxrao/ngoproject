
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbconnect";
import NGO from "@/models/NGO";
import Restaurant from "@/models/Restaurant";
import { getCurrentUser } from "@/utils/auth";

export async function GET() {
  try {
    await dbConnect();

    // Authenticate the user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in first.",
        },
        { status: 401 }
      );
    }

    // Only NGOs can access this endpoint
    if (user.role !== "ngo") {
      return NextResponse.json(
        {
          success: false,
          message: "Only NGOs can find nearby restaurants.",
        },
        { status: 403 }
      );
    }

    // Find the logged-in NGO's profile
    const ngo = await NGO.findOne({
      userId: user.userId,
    })
      .select("location verified")
      .lean();

    if (!ngo) {
      return NextResponse.json(
        {
          success: false,
          message: "NGO profile not found.",
        },
        { status: 404 }
      );
    }

    if (!ngo.verified) {
      return NextResponse.json(
        {
          success: false,
          message: "Your NGO must be verified to find nearby restaurants.",
        },
        { status: 403 }
      );
    }

    const coordinates = ngo.location?.coordinates;

    if (
      !coordinates ||
      coordinates.length !== 2 ||
      !Number.isFinite(coordinates[0]) ||
      !Number.isFinite(coordinates[1])
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Your NGO location coordinates are invalid.",
        },
        { status: 400 }
      );
    }

    // Search within exactly 5 kilometres
    const restaurants = await Restaurant.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [coordinates[0], coordinates[1]],
          },
          key: "location",
          distanceField: "distanceMeters",
          maxDistance: 5000,
          spherical: true,
        },
      },
      {
        $project: {
          _id: 1,
          restaurantName: 1,
          address: 1,
          location: 1,
          verified: 1,
          donating: 1,
          distanceMeters: 1,
        },
      },
      {
        $limit: 100,
      },
    ]);

    const nearbyRestaurants = restaurants.map((restaurant) => ({
      ...restaurant,
      distanceKm: Number(
        (restaurant.distanceMeters / 1000).toFixed(2)
      ),
    }));

    return NextResponse.json(
      {
        success: true,
        count: nearbyRestaurants.length,
        radiusKm: 5,
        restaurants: nearbyRestaurants,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Nearby restaurants API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch nearby restaurants.",
      },
      { status: 500 }
    );
  }
}
