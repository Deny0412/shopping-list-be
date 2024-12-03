import { POST as handler } from "@/src/app/api/user/login/route";
import { NextRequest } from "next/server";
import mongoose from "mongoose";
import User from "@/src/models/User";
import dbConnect from "@/src/utils/dbConnect";

jest.mock("@/src/utils/dbConnect", () => jest.fn());

describe("POST /api/user/login", () => {
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

    const userInDb = await User.findOne({ email: requestBody.email });

    expect(userInDb).not.toBeNull(); // Uživatel existuje
    expect(userInDb.token).not.toBeNull(); // Token není null
  });

  it("should return 401 for invalid credentials", async () => {
    const requestBody = {
      email: "neexistujiciuzivatel@mail.cz",
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
});
