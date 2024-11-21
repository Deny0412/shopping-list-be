import { NextResponse } from "next/server";
import shoppingListAbl from "@/src/abl/shoppingListAbl";
import { authMiddleware } from "@/src/middleware/authMiddleware";

async function handler(request) {
  if (request.method !== "POST") {
    return NextResponse.json(
      { success: false, message: "Method Not Allowed" },
      { status: 405 }
    );
  }

  try {
    const { shoppingListId, name, quantity } = await request.json();
    const userId = request.user?.id;

    if (!shoppingListId || !name || !quantity) {
      return NextResponse.json(
        {
          success: false,
          message: "ShoppingList ID, name, and quantity are required",
        },
        { status: 400 }
      );
    }

    const newItem = await shoppingListAbl.addItem({
      listId: shoppingListId,
      name,
      quantity,
      userId,
    });

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export const POST = authMiddleware(handler);
