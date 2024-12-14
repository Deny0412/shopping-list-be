import { NextResponse } from "next/server";
import dbConnect from "@/src/utils/dbConnect";
import shoppingListAbl from "@/src/abl/shoppingListAbl";

export async function PUT(request) {
  await dbConnect();
  try {
    if (request.method !== "PUT") {
      return NextResponse.json(
        { message: "Method Not Allowed" },
        { status: 405 }
      );
    }

    // Načtení dat přímo z těla požadavku
    const { id, name, members, items, userId } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Shopping list ID is required" },
        { status: 400 }
      );
    }

    const updatedShoppingList = await shoppingListAbl.updateShoppingList({
      id,
      name,
      members,
      items,
      userId,
    });

    return NextResponse.json({ ...updatedShoppingList._doc }, { status: 200 });
  } catch (error) {
    console.error("Error updating shopping list:", error);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
