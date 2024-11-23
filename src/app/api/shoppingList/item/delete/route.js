import { NextResponse } from "next/server";
import shoppingListAbl from "@/src/abl/shoppingListAbl";
import { authMiddleware } from "@/src/middleware/authMiddleware";

async function handler(request) {
  if (request.method !== "DELETE") {
    return NextResponse.json(
      { success: false, message: "Method Not Allowed" },
      { status: 405 }
    );
  }

  try {
    const { shoppingListId, itemId } = await request.json();
    const userId = request.user?.id;

    if (!shoppingListId || !itemId) {
      return NextResponse.json(
        {
          success: false,
          message: "ShoppingList ID and Item ID are required",
        },
        { status: 400 }
      );
    }

    const result = await shoppingListAbl.deleteItem({
      listId: shoppingListId,
      itemId,
      userId,
    });

    return NextResponse.json(
      { success: true, message: result.message },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export const DELETE = authMiddleware(handler);
