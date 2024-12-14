import { NextResponse } from "next/server";
import dbConnect from "@/src/utils/dbConnect";
import shoppingListAbl from "@/src/abl/shoppingListAbl";

export async function POST(request) {
  await dbConnect();
  try {
    const { userId, name, members, items } = await request.json();

    // Přímé zpracování bez middleware
    const ownerId = userId; // Předpokládá se, že `user` je obsažen v těle požadavku

    const result = await shoppingListAbl.createShoppingList({
      name,
      members,
      items,
      ownerId,
    });

    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (error) {
    console.error("Error creating shopping list:", error);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
