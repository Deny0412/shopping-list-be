import { NextResponse } from "next/server";
import dbConnect from "@/src/utils/dbConnect";
import { authMiddleware } from "@/src/middleware/authMiddleware";
import shoppingListAbl from "@/src/abl/shoppingListAbl";

export async function handler(request) {
  await dbConnect();
  try {
    const { user, name, members, items } = await request.json();
    let ownerId = request.user?.id; // Přístup k uživatelským údajům z middleware
    //test
    if (!ownerId) {
      ownerId = user.id;
    }
    //endtest
    const result = await shoppingListAbl.createShoppingList({
      name,
      members,
      items,
      ownerId,
    });
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
