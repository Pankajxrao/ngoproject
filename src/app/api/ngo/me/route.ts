
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbconnect";
import NGO from "@/models/NGO";
import { getCurrentUser } from "@/utils/auth";

export async function GET() {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in.",
        },
        { status: 401 }
      );
    }

    if (user.role !== "ngo") {
      return NextResponse.json(
        {
          success: false,
          message: "Only NGO accounts can access this route.",
        },
        { status: 403 }
      );
    }

    const ngo = await NGO.findOne({ userId: user.userId })
      .select(
        "ngoName address location verified acceptingDonations capacity createdAt updatedAt"
      )
      .lean();

    if (!ngo) {
      return NextResponse.json(
        {
          success: false,
          message: "NGO profile not found. Please create your NGO profile.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        ngo,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/ngo/me error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}
