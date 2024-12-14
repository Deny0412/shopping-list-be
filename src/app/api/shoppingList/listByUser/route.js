import { NextResponse } from "next/server";
import shoppingListAbl from "@/src/abl/shoppingListAbl";

export async function GET(request) {
  if (request.method !== "GET") {
    return NextResponse.json(
      { message: "Method Not Allowed" },
      { status: 405 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const lists = await shoppingListAbl.getListsByUser(userId);

    return NextResponse.json(lists, { status: 200 });
  } catch (error) {
    console.error("Error fetching shopping lists:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
