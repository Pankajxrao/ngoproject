import { dbConnect } from "@/lib/dbconnect";
import NGO from "@/models/NGO";
import { ApiError } from "@/utils/ApiError";
import { getCurrentUser } from "@/utils/auth";
import { ngoSchema } from "@/schemas/NGOSchema";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    const ngos = await NGO.find()
      .select("ngoName address location verified createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: ngos.length,
      ngos,
    });
  } catch (error) {
    console.error("Fetch NGOs error:", error);

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

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (user.role !== "ngo") {
      throw new ApiError(403, "Only NGO users can create an NGO profile");
    }

    // Prevent one user from creating multiple NGO profiles
    const existingNGO = await NGO.findOne({
      userId: user.userId,
    });

    if (existingNGO) {
      throw new ApiError(409, "NGO profile already exists for this user");
    }

    const body: unknown = await req.json();
    const parsed = ngoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { ngoName, address, latitude, longitude } = parsed.data;

    const ngo = await NGO.create({
      userId: user.userId,
      ngoName,
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
        message: "NGO profile created successfully",
        ngo,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create NGO error:", error);

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
        message: "Failed to create NGO profile",
      },
      { status: 500 }
    );
  }
}