import { handler } from "@/src/app/api/shoppingList/create/route";
import { GET as verifyHandler } from "@/src/app/api/auth/verify/route";
import { NextRequest } from "next/server";
import mongoose from "mongoose";
import User from "@/src/models/User";
import dbConnect from "@/src/utils/dbConnect";
import ShoppingList from "@/src/models/ShoppingList";
import { POST as loginHandler } from "@/src/app/api/user/login/route";
import shoppingListAbl from "@/src/abl/shoppingListAbl";
import { GET as detailHandler } from "@/src/app/api/shoppingList/detail/route";
// Mock připojení k databázi
jest.mock("@/src/utils/dbConnect", () => jest.fn());

// Import tokenu z globální proměnné (z předchozího testu)
let authToken;
let userInfo;
let shoppingListId;
let userEmail;
describe("POST /api/shoppingList/create", () => {
  beforeAll(async () => {
    // Mock připojení k databázi
    dbConnect.mockResolvedValueOnce();

    // Připojení k testovací databázi
    const mongoUri = "mongodb://localhost:27017/test-db";
    await mongoose.connect(mongoUri, {});

    // Vytvoření testovacího uživatele
    const user = await User.create({
      name: "Test User",
      email: "testuser@example.com",
    });
    userEmail = user.email;

    // Simulace loginu pro získání tokenu
    const loginRequest = new NextRequest(
      "http://localhost:3000/api/user/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      }
    );
    const loginResponse = await loginHandler(loginRequest);
    const loginData = await loginResponse.json();

    // Uložení tokenu do globální proměnné
    authToken = loginData.token;
    console.log(authToken);
  });

  afterAll(async () => {
    // Vyčištění databáze a odpojení
    await mongoose.connection.db.dropDatabase();

    await mongoose.disconnect();
  });
  //OVĚŘENÍ TOKENU + ULOŽENÍ USERINFO
  it("should verify a valid token successfully", async () => {
    // Vytvoření NextRequest pro simulaci požadavku
    const request = new NextRequest("http://localhost:3000/api/auth/verify", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    // Zavolání handleru
    const response = await verifyHandler(request);
    const responseData = await response.json();

    // Ověření odpovědi
    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    userInfo = responseData.user;
  });
  //CREATE SHOPPINGLIST
  it("should create a new shopping list successfully", async () => {
    const requestBody = {
      name: "Test Shopping List",
      members: [],
      items: [
        { name: "Milk", quantity: "2", status: "pending" },
        { name: "Bread", quantity: "1", status: "pending" },
      ],
      user: userInfo,
    };

    // Mock request s použitím uloženého tokenu
    const request = new NextRequest(
      "http://localhost:3000/api/shoppingList/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`, // Použití tokenu z globální proměnné
        },
        body: JSON.stringify(requestBody),
      }
    );

    const response = await handler(request);
    const responseData = await response.json();
    shoppingListId = responseData.data._id;
    // Ověření odpovědi
    expect(response.status).toBe(201);
    expect(responseData.success).toBe(true);
    expect(responseData.data.name).toBe(requestBody.name);
  });

  //LOGIN
  it("should log in a user successfully", async () => {
    // Simulace loginu pro získání tokenu
    const loginRequest = new NextRequest(
      "http://localhost:3000/api/user/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      }
    );
    const loginResponse = await loginHandler(loginRequest);
    const loginData = await loginResponse.json();

    // Uložení tokenu do globální proměnné
    authToken = loginData.token;
    console.log(authToken);
  });

  //DETAIL SHOPPINGLIST
  it("should return one shopping list", async () => {
    // Mock request s použitím uloženého tokenu
    const request = new NextRequest(
      "http://localhost:3000/api/shoppingList/detail?id=" +
        shoppingListId +
        "&userId=" +
        userInfo.id,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    console.log(request);

    const response = await detailHandler(request);
    const responseData = await response.json();

    // Ověření odpovědi
    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.data).not.toBeNull();
  });
});
