import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbconnect";
import { getCurrentUser } from "@/utils/auth";
import NGO from "@/models/NGO";
import { ngoSchema } from "@/schemas/NGOSchema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid NGO ID" },
        { status: 400 }
      );
    }

    const ngo = await NGO.findById(id)
      .select("ngoName address location verified createdAt updatedAt")
      .lean();

    if (!ngo) {
      return NextResponse.json(
        { message: "NGO not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ngo,
    });
  } catch (error) {
    console.error("Fetch NGO error:", error);

    return NextResponse.json(
      { message: "Failed to fetch NGO" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "ngo" && user.role !== "admin") {
      return NextResponse.json(
        { message: "Only NGO accounts or admins can update NGO profiles" },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid NGO ID" },
        { status: 400 }
      );
    }

    const ngo = await NGO.findById(id);

    if (!ngo) {
      return NextResponse.json(
        { message: "NGO not found" },
        { status: 404 }
      );
    }

    if (
      ngo.userId.toString() !== user.userId &&
      user.role !== "admin"
    ) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const body: unknown = await req.json();
    const parsed = ngoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { ngoName, address, latitude, longitude } = parsed.data;

    const locationChanged =
      ngo.address !== address ||
      ngo.location.coordinates[0] !== longitude ||
      ngo.location.coordinates[1] !== latitude;

    ngo.ngoName = ngoName;
    ngo.address = address;
    ngo.location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    if (locationChanged) {
      ngo.verified = false;
    }

    await ngo.save();

    return NextResponse.json({
      success: true,
      message: "NGO updated successfully",
      ngo: {
        _id: ngo._id,
        ngoName: ngo.ngoName,
        address: ngo.address,
        location: ngo.location,
        verified: ngo.verified,
        createdAt: ngo.createdAt,
        updatedAt: ngo.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update NGO error:", error);

    return NextResponse.json(
      { message: "Failed to update NGO" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "ngo" && user.role !== "admin") {
      return NextResponse.json(
        { message: "Only NGO accounts or admins can delete NGO profiles" },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid NGO ID" },
        { status: 400 }
      );
    }

    const ngo = await NGO.findById(id);

    if (!ngo) {
      return NextResponse.json(
        { message: "NGO not found" },
        { status: 404 }
      );
    }

    if (
      ngo.userId.toString() !== user.userId &&
      user.role !== "admin"
    ) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    await ngo.deleteOne();

    return NextResponse.json({
      success: true,
      message: "NGO deleted successfully",
    });
  } catch (error) {
    console.error("Delete NGO error:", error);

    return NextResponse.json(
      { message: "Failed to delete NGO" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "ngo") {
      return NextResponse.json(
        {
          success: false,
          message: "Only NGO users can update availability",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid NGO ID" },
        { status: 400 }
      );
    }

    const body: unknown = await req.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("acceptingDonations" in body) ||
      typeof body.acceptingDonations !== "boolean"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "acceptingDonations must be a boolean",
        },
        { status: 400 }
      );
    }

    const ngo = await NGO.findById(id);

    if (!ngo) {
      return NextResponse.json(
        { success: false, message: "NGO not found" },
        { status: 404 }
      );
    }

    if (ngo.userId.toString() !== user.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only update your own NGO profile",
        },
        { status: 403 }
      );
    }

    if (!ngo.verified) {
      return NextResponse.json(
        {
          success: false,
          message: "NGO must be verified before updating availability",
        },
        { status: 403 }
      );
    }

    ngo.acceptingDonations = body.acceptingDonations;

    await ngo.save();

    return NextResponse.json({
      success: true,
      message: "NGO availability updated successfully",
      acceptingDonations: ngo.acceptingDonations,
    });
  } catch (error) {
    console.error("Update NGO availability error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update NGO availability",
      },
      { status: 500 }
    );
  }
}

