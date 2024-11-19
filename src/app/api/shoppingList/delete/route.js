import { NextResponse } from "next/server";
import dbConnect from "@/src/utils/dbConnect";
import { authMiddleware } from "@/src/middleware/authMiddleware";
import ShoppingListABL from "@/src/abl/shoppingListAbl";

async function handler(request) {
  await dbConnect();
  try {
    if (request.method !== "DELETE") {
      return NextResponse.json(
        { success: false, message: "Method Not Allowed" },
        { status: 405 }
      );
    }

    const { id } = await request.json();
    const userId = request.user?.id; // User ID from authenticated request

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Shopping list ID is required" },
        { status: 400 }
      );
    }

    const result = await ShoppingListABL.deleteShoppingList(id, userId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

export const DELETE = authMiddleware(handler);
