import { GET as verifyHandler } from "@/src/app/api/auth/verify/route";
import { NextRequest } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/src/utils/dbConnect";
import User from "@/src/models/User";
import { POST as loginHandler } from "@/src/app/api/user/login/route";

jest.mock("@/src/utils/dbConnect", () => jest.fn());
let authToken;
describe("POST /api/auth/verify", () => {
  beforeAll(async () => {
    // Mock připojení k databázi
    dbConnect.mockResolvedValueOnce();
    const mongoUri = "mongodb://localhost:27017/test-db";
    await mongoose.connect(mongoUri, {});
    // Vytvoření testovacího uživatele
    const user = await User.create({
      name: "Test User",
      email: "testuser@example.com",
      token: null, // Token bude přidán během loginu
    });

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
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("should verify a valid token successfully", async () => {
    // Vytvoření NextRequest pro simulaci požadavku
    const request = new NextRequest("http://localhost:3000/api/auth/verify", {
      method: "POST",
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
  });

  it("should return 401 for an invalid token", async () => {
    const invalidToken = "invalid-token";

    // Vytvoření NextRequest pro simulaci požadavku
    const request = new NextRequest("http://localhost:3000/api/auth/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${invalidToken}`,
      },
    });

    // Zavolání handleru
    const response = await verifyHandler(request);
    const responseData = await response.json();
    console.log(responseData);
    // Ověření odpovědi
    expect(response.status).toBe(403);
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe("Invalid token");
  });

  it("should return 401 when no token is provided", async () => {
    // Vytvoření NextRequest bez tokenu
    const request = new NextRequest("http://localhost:3000/api/auth/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Zavolání handleru
    const response = await verifyHandler(request);
    const responseData = await response.json();

    // Ověření odpovědi
    expect(response.status).toBe(401);
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe("No token provided or invalid format");
  });
});
