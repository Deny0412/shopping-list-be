import { NextResponse } from "next/server";
import dbConnect from "@/src/utils/dbConnect";
import User from "@/src/models/User";

export async function POST(request) {
  await dbConnect();

  try {
    const { name, email } = await request.json();
    const user = new User({ name, email });
    await user.save();

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
