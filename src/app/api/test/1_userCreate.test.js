import { POST as handler } from "@/src/app/api/user/create/route";
import { NextRequest } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/src/utils/dbConnect";

jest.mock("@/src/utils/dbConnect", () => jest.fn());

describe("POST /api/user/create", () => {
  beforeAll(async () => {
    // Mock připojení k databázi
    dbConnect.mockResolvedValueOnce();
    // Připojení k testovací databázi
    const mongoUri = "mongodb://localhost:27017/test-db";
    await mongoose.connect(mongoUri, {});
  });

  afterAll(async () => {
    // Odpojení od testovací databáze
    await mongoose.disconnect();
  });

  /* afterEach(async () => {
    // Vyčištění kolekce uživatelů po každém testu
    await User.deleteMany({});
  }); */

  it("should create a new user successfully", async () => {
    // Simulace těla požadavku
    const requestBody = {
      name: "Test User",
      email: "testuser@example.com",
    };

    // Vytvoření mockovaného NextRequest
    const url = "http://localhost:3000/api/user/create";
    const request = new NextRequest(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Zavolání handleru
    const response = await handler(request);
    const responseData = await response.json();

    // Ověření odpovědi
    expect(response.status).toBe(201);
    expect(responseData.success).toBe(true);
    expect(responseData.data.name).toBe(requestBody.name);
    expect(responseData.data.email).toBe(requestBody.email);

    // Ověření uložení do databáze
    /* const userInDb = await User.findOne({ email: requestBody.email });
    expect(userInDb).not.toBeNull();
    expect(userInDb.name).toBe(requestBody.name); */
  });

  it("should return 400 when missing required fields", async () => {
    // Simulace těla požadavku bez povinných polí
    const requestBody = {};

    // Vytvoření mockovaného NextRequest
    const url = "http://localhost:3000/api/user/create";
    const request = new NextRequest(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Zavolání handleru
    const response = await handler(request);
    const responseData = await response.json();

    // Ověření odpovědi
    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain("User validation failed");
  });
});
