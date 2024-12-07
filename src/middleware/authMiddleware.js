import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import dbConnect from "@/src/utils/dbConnect";
import User from "@/src/models/User";

export function authMiddleware(handler) {
  return async (request) => {
    await dbConnect();

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

      // Najděte uživatele podle ID z dekódovaného tokenu
      const user = await User.findById(decodedToken.id);
      //const user = await User.findById(decodedToken);
      // Zkontrolujte, zda uživatel existuje a zda token odpovídá
      if (!user || user.token !== token) {
        return NextResponse.json(
          { success: false, message: "Invalid or expired token" },
          { status: 403 }
        );
      }

      // Přidejte data uživatele k požadavku pro další použití
      request.user = decodedToken;
      //console.log("Decoded Token:", decodedToken);

      request.userData = user;
      //console.log("Request User:", request.user);

      // Pokračujte ve zpracování požadavku
      return handler(request);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 403 }
      );
    }
  };
}
