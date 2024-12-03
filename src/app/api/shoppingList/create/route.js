import { NextResponse } from "next/server";
import dbConnect from "@/src/utils/dbConnect";
import { authMiddleware } from "@/src/middleware/authMiddleware";
import shoppingListAbl from "@/src/abl/shoppingListAbl";

async function handler(request) {
  await dbConnect();
  try {
    const { name, members, items } = await request.json();
    const ownerId = request.user?.id; // Přístup k uživatelským údajům z middleware

    const result = await shoppingListAbl.createShoppingList({
      name,
      members,
      items,
      ownerId,
    });
    console.log("Handler result:", result);
    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (error) {
    console.error("Error creating shopping list:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

export const POST = authMiddleware(handler);
