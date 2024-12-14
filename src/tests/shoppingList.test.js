import request from "supertest";
import mongoose from "mongoose";
import { NextRequest } from "next/server";
import { MongoMemoryServer } from "mongodb-memory-server";
import dbConnect from "@/src/utils/dbConnect";
import { POST as userHandler } from "@/src/app/api/user/create/route";
// Jest mockování dbConnect
jest.mock("@/src/utils/dbConnect", () => jest.fn());

// MongoMemoryServer pro testovací databázi
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Mock připojení k databázi
  dbConnect.mockResolvedValueOnce();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Shopping List Endpoints", () => {
  describe("POST /api/user/create", () => {
    it("should create a new user", async () => {
      const requestBody = {
        name: "Test User",
        email: "testuser@emial.cz",
      };
      const request = new NextRequest("http://localhost:3000/api/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Použití tokenu z globální proměnné
        },
        body: JSON.stringify(requestBody),
      });

      const response = await userHandler(request);

      // Ověření odpovědi
      expect(response.status).toBe(201);
    });
  });

  /*describe("POST /api/shoppingList/create", () => {
    it("should create a new shopping list", async () => {
      const shoppingListHandler = (
        await import("@/pages/api/shoppingList/create")
      ).default;

      const response = await request(shoppingListHandler)
        .post("/api/shoppingList/create")
        .send({
          userId: "123456789012345678901234",
          name: "Test Shopping List",
          members: ["456789012345678901234567", "789012345678901234567890"],
          items: [
            { name: "Milk", quantity: "2 liters" },
            { name: "Bread", quantity: "1 loaf" },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Test Shopping List");
      expect(response.body.data.members.length).toBe(2);
      expect(response.body.data.items.length).toBe(2);
    });
  });

  describe("PUT /api/shoppingList/update", () => {
    it("should update an existing shopping list", async () => {
      const createHandler = (await import("@/pages/api/shoppingList/create"))
        .default;
      const updateHandler = (await import("@/pages/api/shoppingList/update"))
        .default;

      // Nejprve vytvořte shopping list
      const createResponse = await request(createHandler)
        .post("/api/shoppingList/create")
        .send({
          userId: "123456789012345678901234",
          name: "Test Shopping List",
          members: ["456789012345678901234567", "789012345678901234567890"],
          items: [
            { name: "Milk", quantity: "2 liters" },
            { name: "Bread", quantity: "1 loaf" },
          ],
        });

      const listId = createResponse.body.data._id;

      const updateResponse = await request(updateHandler)
        .put("/api/shoppingList/update")
        .send({
          id: listId,
          name: "Updated Shopping List",
          members: ["456789012345678901234567"],
          items: [
            { name: "Eggs", quantity: "1 dozen" },
            { name: "Butter", quantity: "1 lb" },
          ],
          userId: "123456789012345678901234",
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.name).toBe("Updated Shopping List");
    });
  });

  describe("DELETE /api/shoppingList/delete", () => {
    it("should delete an existing shopping list", async () => {
      const createHandler = (await import("@/pages/api/shoppingList/create"))
        .default;
      const deleteHandler = (await import("@/pages/api/shoppingList/delete"))
        .default;

      const createResponse = await request(createHandler)
        .post("/api/shoppingList/create")
        .send({
          userId: "123456789012345678901234",
          name: "Test Shopping List",
          members: ["456789012345678901234567", "789012345678901234567890"],
          items: [
            { name: "Milk", quantity: "2 liters" },
            { name: "Bread", quantity: "1 loaf" },
          ],
        });

      const listId = createResponse.body.data._id;

      const deleteResponse = await request(deleteHandler)
        .delete("/api/shoppingList/delete")
        .send({
          id: listId,
          userId: "123456789012345678901234",
        });

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.message).toBe(
        "Shopping list deleted successfully"
      );
    });
  }); */
});
