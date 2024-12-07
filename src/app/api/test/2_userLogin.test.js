import { POST as handler } from "@/src/app/api/user/login/route";
import { NextRequest } from "next/server";
import mongoose from "mongoose";
import User from "@/src/models/User";
import dbConnect from "@/src/utils/dbConnect";

jest.mock("@/src/utils/dbConnect", () => jest.fn());

let authToken; // Globální proměnná pro ukládání tokenu

describe("POST /api/user/login", () => {
  beforeAll(async () => {
    // Mock připojení k databázi
    dbConnect.mockResolvedValueOnce();
    // Připojení k testovací databázi
    const mongoUri = "mongodb://localhost:27017/test-db";
    await mongoose.connect(mongoUri, {});

    // Vytvoření uživatele pro test
    await User.create({
      name: "Test User",
      email: "testuser@example.com",
      token: null, // Zpočátku bez tokenu
    });
  });

  afterAll(async () => {
    // Vymazání kolekce a odpojení od databáze
    //await User.deleteMany({});
    await mongoose.disconnect();
  });

  it("should log in a user successfully", async () => {
    const requestBody = {
      email: "testuser@example.com",
    };

    const request = new NextRequest("http://localhost:3000/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    // Ověření, že token byl vytvořen a uživatel existuje v DB
    const userInDb = await User.findOne({ email: requestBody.email });
    expect(userInDb).not.toBeNull(); // Uživatel existuje
    expect(userInDb.token).not.toBeNull(); // Token není null

    // Uložení tokenu pro další testy
    authToken = userInDb.token;

    // Ověření tokenu
    expect(authToken).toBe(data.token);
  });

  it("should return 401 for invalid credentials", async () => {
    const requestBody = {
      email: "nonexistentuser@example.com",
    };

    const request = new NextRequest("http://localhost:3000/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.message).toBe("Invalid credentials");
  });

  it("should reuse the token in another test", async () => {
    // Test, který ověří, že token je dostupný
    expect(authToken).toBeDefined();
    expect(typeof authToken).toBe("string");

    // Lze provést další testy, které používají token, např. pro autorizaci
  });
});
