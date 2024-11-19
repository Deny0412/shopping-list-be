import { NextResponse } from "next/server";
import dbConnect from "@/src/utils/dbConnect";
import { authMiddleware } from "@/src/middleware/authMiddleware";
import shoppingListAbl from "@/src/abl/shoppingListAbl";

async function handler(request) {
  await dbConnect();
  try {
    if (request.method !== "PUT") {
      return NextResponse.json(
        { success: false, message: "Method Not Allowed" },
        { status: 405 }
      );
    }

    const { id, name, members, items } = await request.json();
    const userId = request.user?.id; // Check if `request.user` is set by middleware

    const updatedShoppingList = await shoppingListAbl.updateShoppingList({
      id,
      name,
      members,
      items,
      userId,
    });

    return NextResponse.json(
      { success: true, ...updatedShoppingList._doc },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating shopping list:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

export const PUT = authMiddleware(handler);
