import { NextResponse } from "next/server";
import shoppingListAbl from "@/src/abl/shoppingListAbl";
import { authMiddleware } from "@/src/middleware/authMiddleware";

async function handler(request) {
  if (request.method !== "PUT") {
    return NextResponse.json(
      { success: false, message: "Method Not Allowed" },
      { status: 405 }
    );
  }

  try {
    // Získání dat z požadavku
    const { shoppingListId, itemId, name, quantity, status } =
      await request.json();
    const userId = request.user?.id;

    // Validace povinných polí
    if (!shoppingListId || !itemId) {
      return NextResponse.json(
        { success: false, message: "ShoppingList ID and Item ID are required" },
        { status: 400 }
      );
    }

    // Aktualizace položky pomocí ABL
    const updatedItem = await shoppingListAbl.updateItem({
      listId: shoppingListId,
      itemId,
      name,
      quantity,
      status,
      userId,
    });

    return NextResponse.json(
      { success: true, data: updatedItem },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating item:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export const PUT = authMiddleware(handler);
