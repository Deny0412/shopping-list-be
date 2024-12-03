import dbConnect from "@/src/utils/dbConnect";
import User from "@/src/models/User";
import { generateToken } from "@/src/utils/jwt";
import { NextResponse } from "next/server";

export async function POST(request) {
  // Připojení k databázi
  await dbConnect();

  try {
    // Získání dat z těla požadavku
    const { email } = await request.json();

    // Zkontrolování, zda uživatel s tímto e-mailem existuje
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Invalid credentials" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generování nového JWT tokenu
    const token = generateToken({
      id: existingUser._id,
      email: existingUser.email,
    });

    // Uložení nového tokenu do databáze, přepíše starý token
    existingUser.token = token;
    await existingUser.save();

    // Vrácení odpovědi s tokenem
    return new NextResponse(JSON.stringify({ success: true, token }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Ošetření chyby a vrácení odpovědi
    return new NextNextResponse(
      JSON.stringify({ success: false, message: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
