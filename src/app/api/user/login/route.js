import dbConnect from "@/src/utils/dbConnect";
import User from "@/src/models/User";
import { generateToken } from "@/src/utils/jwt";

export async function POST(request) {
  // Připojení k databázi
  await dbConnect();

  try {
    // Získání dat z těla požadavku
    const { email } = await request.json();

    // Zkontrolování, zda uživatel s tímto e-mailem existuje
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid credentials" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generování JWT tokenu pro existujícího uživatele
    const token = generateToken({
      id: existingUser._id,
      email: existingUser.email,
    });

    // Vrácení odpovědi s tokenem
    return new Response(JSON.stringify({ success: true, token }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Ošetření chyby a vrácení odpovědi
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
