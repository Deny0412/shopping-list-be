import { NextResponse } from "next/server";
import dbConnect from "@/src/utils/dbConnect";
import shoppingListAbl from "@/src/abl/shoppingListAbl";

export async function DELETE(request) {
  if (request.method !== "DELETE") {
    return NextResponse.json(
      { message: "Method Not Allowed" },
      { status: 405 }
    );
  }
  await dbConnect();
  try {
    // Načtení dat z těla požadavku
    const { shoppingListId, itemId, userId } = await request.json();

    if (!shoppingListId || !itemId || !userId) {
      return NextResponse.json(
        {
          message: "ShoppingList ID, Item ID, and User ID are required",
        },
        { status: 400 }
      );
    }

    // Volání ABL vrstvy pro smazání položky
    const result = await shoppingListAbl.deleteItem({
      listId: shoppingListId,
      itemId,
      userId,
    });

    return NextResponse.json({ message: result.message }, { status: 200 });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
