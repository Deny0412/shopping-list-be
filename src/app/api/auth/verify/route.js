import { NextResponse } from "next/server";
import { verifyToken } from "@/src/utils/jwt";

export async function GET(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { success: false, message: "No token provided or invalid format" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token
    const decoded = verifyToken(token);

    // If decoded is falsy, return an error
    if (
      !decoded ||
      (typeof decoded === "object" && decoded.name === "JsonWebTokenError")
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, user: decoded });
  } catch (error) {
    // Catch any errors during token verification
    return NextResponse.json(
      { success: false, message: "Invalid token", error: error.message },
      { status: 403 }
    );
  }
}
