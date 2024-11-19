import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export function authMiddleware(handler) {
  return async (request) => {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      // Přidá dekódovaný token do požadavku
      request.user = decodedToken;
      // Pokračuje v zpracování požadavku s handlerem
      return handler(request);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 403 }
      );
    }
  };
}
