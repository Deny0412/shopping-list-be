/* import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import dbConnect from "@/src/utils/dbConnect";
import User from "@/src/models/User";

export function authMiddleware(handler) {
  return async (request) => {
    await dbConnect();

    const authHeader =
      request.headers.get("authorization") || request.headers["authorization"];

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
export async function validateRequest(request) {
  const authHeader =
    request.headers.get("authorization") || request.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { success: false, message: "Unauthorized access", status: 401 };
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Najděte uživatele podle ID z dekódovaného tokenu
    const user = await User.findById(decodedToken.id);

    if (!user || user.token !== token) {
      return {
        success: false,
        message: "Invalid or expired token",
        status: 403,
      };
    }

    return { success: true, user, decodedToken };
  } catch {
    return { success: false, message: "Invalid or expired token", status: 403 };
  }
}
 */

import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import User from "@/src/models/User";

export async function validateRequest(request) {
  const authHeader =
    request.headers.get("authorization") || request.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { success: false, message: "Unauthorized access", status: 401 };
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Najděte uživatele podle ID z dekódovaného tokenu
    const user = await User.findById(decodedToken.id);

    if (!user || user.token !== token) {
      return {
        success: false,
        message: "Invalid or expired token",
        status: 403,
      };
    }

    return { success: true, user, decodedToken };
  } catch (error) {
    return { success: false, message: "Invalid or expired token", status: 403 };
  }
}

export function authMiddleware(handler) {
  return async (request) => {
    // Validace žádosti
    const validationResult = await validateRequest(request);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, message: validationResult.message },
        { status: validationResult.status }
      );
    }

    // Přidejte informace o uživateli do požadavku
    request.user = validationResult.decodedToken;
    request.userData = validationResult.user;

    // Předání požadavku handleru
    return handler(request);
  };
}
