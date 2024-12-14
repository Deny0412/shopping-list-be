import { NextResponse } from "next/server";
import shoppingListAbl from "@/src/abl/shoppingListAbl";
import dbConnect from "@/src/utils/dbConnect";

export async function PUT(request) {
  if (request.method !== "PUT") {
    return NextResponse.json(
      { message: "Method Not Allowed" },
      { status: 405 }
    );
  }
  await dbConnect();
  try {
    // Získání dat z požadavku
    const { shoppingListId, itemId, status, userId } = await request.json();

    // Validace povinných polí
    if (!shoppingListId || !itemId || !status || !userId) {
      return NextResponse.json(
        {
          message: "ShoppingList ID, Item ID, status, and User ID are required",
        },
        { status: 400 }
      );
    }

    // Aktualizace statusu položky pomocí ABL
    const updatedItem = await shoppingListAbl.resolveItem({
      listId: shoppingListId,
      itemId,
      status,
      userId,
    });

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error("Error resolving item:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
