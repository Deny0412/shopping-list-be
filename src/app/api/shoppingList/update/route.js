import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/src/utils/dbConnect";
import ShoppingList from "@/src/models/ShoppingList";
import { authMiddleware } from "@/src/middleware/authMiddleware";

async function handler(request) {
  await dbConnect();
  try {
    if (request.method !== "PUT") {
      return NextResponse.json(
        { success: false, message: "Method Not Allowed" },
        { status: 405 }
      );
    }

    const { id, name, members, items } = await request.json();
    const userId = request.user?.id; // Zkontrolujte, zda `request.user` existuje

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Shopping list ID is required" },
        { status: 400 }
      );
    }

    // Zkontrolujte, zda je `id` platné ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid shopping list ID" },
        { status: 400 }
      );
    }

    // Najděte seznam podle ID
    const shoppingList = await ShoppingList.findById(id);
    if (!shoppingList) {
      return NextResponse.json(
        { success: false, message: "Shopping list not found" },
        { status: 404 }
      );
    }

    // Ověřte, zda je uživatel vlastníkem seznamu
    if (shoppingList.ownerId.toString() !== userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Pouze vlastník může aktualizovat název a členy
    if (name) {
      shoppingList.name = name;
    }

    if (Array.isArray(members)) {
      shoppingList.members = members;
    }

    // Ostatní položky (například `items`) může aktualizovat kdokoli, kdo má přístup
    if (Array.isArray(items)) {
      shoppingList.items = items;
    }

    // Uložení aktualizovaného seznamu
    await shoppingList.save();

    return NextResponse.json(
      { success: true, ...shoppingList._doc },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating shopping list:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

export const PUT = authMiddleware(handler);
