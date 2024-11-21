import shoppingListAbl from "@/src/abl/shoppingListAbl";
import { authMiddleware } from "@/src/middleware/authMiddleware";

async function handler(request, { params }) {
  const { listId } = params;
  const userId = request.user?.id; // Získá userId z middleware

  try {
    const shoppingList = await shoppingListAbl.getShoppingList(listId, userId);
    return new Response(JSON.stringify({ success: true, data: shoppingList }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export const GET = authMiddleware(handler);
