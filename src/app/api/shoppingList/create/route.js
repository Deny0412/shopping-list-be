import { NextResponse } from "next/server";
import dbConnect from "../../../../utils/dbConnect";
import ShoppingList from "../../../../models/ShoppingList";

export async function POST(request) {
  await dbConnect();

  try {
    const { name, ownerId } = await request.json();
    const shoppingList = new ShoppingList({ name, ownerId });
    await shoppingList.save();

    return NextResponse.json(
      { success: true, data: shoppingList },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
