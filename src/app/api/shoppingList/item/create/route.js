import { NextResponse } from "next/server";
import dbConnect from "@/src/utils/dbConnect";
import shoppingListAbl from "@/src/abl/shoppingListAbl";

export async function POST(request) {
  if (request.method !== "POST") {
    return NextResponse.json(
      { message: "Method Not Allowed" },
      { status: 405 }
    );
  }
  await dbConnect();
  try {
    // Načtení dat z těla požadavku
    const { shoppingListId, name, quantity, userId } = await request.json();

    if (!shoppingListId || !name || !quantity || !userId) {
      return NextResponse.json(
        {
          message: "ShoppingList ID, name, quantity, and userId are required",
        },
        { status: 400 }
      );
    }

    // Přidání položky do nákupního seznamu
    const newItem = await shoppingListAbl.addItem({
      listId: shoppingListId,
      name,
      quantity,
      userId,
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error adding item:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
