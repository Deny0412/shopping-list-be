import dbConnect from "@/src/utils/dbConnect";
import User from "@/src/models/User";

export async function POST(request) {
  // Připojení k databázi
  await dbConnect();

  try {
    // Získání dat z těla požadavku
    const { name, email } = await request.json();

    // Zkontrolování, zda už uživatel s tímto e-mailem existuje
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(
        JSON.stringify({ success: false, message: "User already exists" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Vytvoření nového uživatele bez generování tokenu
    const user = new User({ name, email });
    await user.save();

    // Vrácení odpovědi bez tokenu
    return new Response(
      JSON.stringify({
        success: true,
        message: "User registered successfully",
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    // Ošetření chyby a vrácení odpovědi
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
