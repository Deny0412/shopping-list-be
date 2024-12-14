import { NextResponse } from "next/server";
import shoppingListAbl from "@/src/abl/shoppingListAbl";
import dbConnect from "@/src/utils/dbConnect";

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
    const { shoppingListId, memberId, userId } = await request.json();

    if (!shoppingListId || !memberId) {
      return NextResponse.json(
        {
          message: "ShoppingList ID and member ID are required",
        },
        { status: 400 }
      );
    }

    // Zavolání ABL vrstvy
    const result = await shoppingListAbl.removeMember({
      shoppingListId,
      memberId,
      userId,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
