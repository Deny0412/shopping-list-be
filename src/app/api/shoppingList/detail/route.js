import { NextResponse } from "next/server";
import shoppingListAbl from "@/src/abl/shoppingListAbl";
import dbConnect from "@/src/utils/dbConnect";

export async function GET(request) {
  await dbConnect();
  try {
    // Extrahujeme `id` a `userId` z dotazovacích parametrů
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!id) {
      return NextResponse.json(
        { message: "Shopping list ID is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Zavoláme ABL vrstvu s parametry
    const shoppingList = await shoppingListAbl.getShoppingListDetail({
      listId: id,
      userId,
    });

    return NextResponse.json(shoppingList);
  } catch (error) {
    console.error("Error fetching shopping list details:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
