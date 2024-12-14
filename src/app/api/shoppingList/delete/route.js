import { NextResponse } from "next/server";
import dbConnect from "@/src/utils/dbConnect";
import ShoppingListABL from "@/src/abl/shoppingListAbl";

export async function DELETE(request) {
  await dbConnect();
  try {
    if (request.method !== "DELETE") {
      return NextResponse.json(
        { success: false, message: "Method Not Allowed" },
        { status: 405 }
      );
    }

    const { id, userId } = await request.json(); // Přímé načtení `userId` z těla požadavku

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Shopping list ID is required" },
        { status: 400 }
      );
    }

    const result = await ShoppingListABL.deleteShoppingList(id, userId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
