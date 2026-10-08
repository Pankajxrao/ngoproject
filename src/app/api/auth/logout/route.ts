import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    cookieStore.delete("token");

    return NextResponse.json(
      {
        success: true,
        message: "Logout successful",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong during logout",
      },
      { status: 500 }
    );
  }
}