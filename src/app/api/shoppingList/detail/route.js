import { NextResponse } from "next/server";
import shoppingListAbl from "@/src/abl/shoppingListAbl";
import { authMiddleware } from "@/src/middleware/authMiddleware";

async function handler(request) {
  // Extrahujeme `id` z dotazovacích parametrů
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Shopping list ID is required" },
      { status: 400 }
    );
  }

  try {
    const userId = request.user?.id; // Získáme přihlášeného uživatele z middleware

    // Zavoláme ABL vrstvu s parametry
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

// Middleware pro autorizaci přidáme k GET handleru
export const GET = authMiddleware(handler);
