import { NextResponse } from "next/server";
import shoppingListAbl from "@/src/abl/shoppingListAbl";
import { authMiddleware } from "@/src/middleware/authMiddleware";

async function handler(request, { params }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Shopping list ID is required" },
      { status: 400 }
    );
  }

  try {
    const userId = request.user?.id;

    const shoppingList = await shoppingListAbl.getShoppingListDetail({
      listId: id,
      userId,
    });

    return NextResponse.json(
      { success: true, data: shoppingList },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export const GET = authMiddleware(handler);
