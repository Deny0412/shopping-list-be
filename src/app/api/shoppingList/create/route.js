import { NextResponse } from "next/server";
import dbConnect from "@/src/utils/dbConnect";
import ShoppingList from "@/src/models/ShoppingList";
import { authMiddleware } from "@/src/middleware/authMiddleware";

async function handler(request) {
  await dbConnect();
  try {
    const { name, members, items } = await request.json();
    const ownerId = request.user?.id; // Zkontrolujte, zda `request.user` existuje

    // Vytvoření nového nákupního seznamu
    const newShoppingList = new ShoppingList({
      name,
      ownerId,
      members,
      items,
    });
    await newShoppingList.save();

    return NextResponse.json(
      { success: true, ...newShoppingList._doc },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating shopping list:", error); // Log the error for debugging
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

export const POST = authMiddleware(handler);
