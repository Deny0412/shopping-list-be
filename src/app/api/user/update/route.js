import { NextResponse } from "next/server";
import dbConnect from "@/src/utils/dbConnect";
import User from "@/src/models/User";
import { authMiddleware } from "@/src/middleware/authMiddleware";

async function handler(request) {
  await dbConnect();

  try {
    const { id, name, email } = await request.json();

    // Najdeme uživatele podle ID a aktualizujeme jeho data
    const user = await User.findByIdAndUpdate(
      id,
      { name, email },
      { new: true, runValidators: true } // Vrátí aktualizovaného uživatele a provede validaci
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export const PUT = authMiddleware(handler);
