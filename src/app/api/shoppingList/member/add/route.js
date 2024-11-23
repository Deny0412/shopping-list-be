import { NextResponse } from "next/server";
import shoppingListAbl from "@/src/abl/shoppingListAbl";
import { authMiddleware } from "@/src/middleware/authMiddleware";

async function handler(request) {
  if (request.method !== "POST") {
    return NextResponse.json(
      { success: false, message: "Method Not Allowed" },
      { status: 405 }
    );
  }

  try {
    const { shoppingListId, memberId } = await request.json();
    const userId = request.user?.id;

    if (!shoppingListId || !memberId) {
      return NextResponse.json(
        {
          success: false,
          message: "ShoppingList ID and member ID are required",
        },
        { status: 400 }
      );
    }

    await shoppingListAbl.addMember({ shoppingListId, memberId, userId });

    return NextResponse.json(
      { success: true, message: "Member added" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export const POST = authMiddleware(handler);
