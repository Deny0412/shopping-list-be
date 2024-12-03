import { POST as handler } from "@/src/app/api/shoppingList/create/route";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/src/models/User";
import dbConnect from "@/src/utils/dbConnect";
import ShoppingList from "@/src/models/ShoppingList"; // Ensure this matches your model path
import { generateToken } from "@/src/utils/jwt"; // Knihovna pro generování tokenů

let createdUser;
describe("POST /api/shoppingList/create", () => {
  beforeAll(async () => {
    // Connect to test database
    await dbConnect();

    // Create a mock user
    createdUser = await User.create({
      name: "Test User",
      email: "testuser@example.com",
    });
    console.log("createdUser", createdUser);
    // Generování reálného tokenu pro vytvořeného uživatele

    await createdUser.save();
    const token = generateToken(
      { id: createdUser._id, email: createdUser.email } // Payload obsahuje ID uživatele
    );
    createdUser.token = token;
    await createdUser.save();
  });
  it("should create a new shopping list successfully", async () => {
    // Adjust requestBody to match the cURL data
    const requestBody = {
      ownerId: createdUser.id,
      name: "Nový název seznamu",
      members: [],
      items: [
        {
          name: "nazevitemu",
          quantity: "10",
          status: "pending",
        },
      ],
    };

    // Create a mock NextRequest
    const url = "http://localhost:3000/api/shoppingList/create";
    const request = new NextRequest(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${createdUser.token}`, // Add the Bearer token
        "User-Agent": "insomnium/0.2.3-a",
      },
      body: JSON.stringify(requestBody),
    });

    // Call the handler and capture the NextResponse
    const response = await handler(request);

    // Parse response data
    const data = await response.json();

    // Validate response
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe(requestBody.name);
    expect(data.data.items[0].name).toBe("nazevitemu");
    expect(data.data.items[0].quantity).toBe("10");
    expect(data.data.items[0].status).toBe("pending");
  }, 10000); // Timeout for the test

  afterAll(async () => {
    // Clean up test database
    await User.deleteMany({});
    await ShoppingList.deleteMany({});
    await mongoose.disconnect();
  }, 20000);
});
