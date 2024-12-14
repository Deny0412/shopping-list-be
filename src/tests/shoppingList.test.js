import mongoose from "mongoose";
import { NextRequest } from "next/server";
import { MongoMemoryServer } from "mongodb-memory-server";
import dbConnect from "@/src/utils/dbConnect";
import { POST as userHandler } from "@/src/app/api/user/create/route";
import { POST as shoppingListCreateHandler } from "@/src/app/api/shoppingList/create/route";
import { PUT as shoppingListUpdateHandler } from "@/src/app/api/shoppingList/update/route";
import { GET as shoppingListDetailHandler } from "@/src/app/api/shoppingList/detail/route";
import { POST as memberAddHandler } from "@/src/app/api/shoppingList/member/add/route";
import { POST as memberRemoveHandler } from "@/src/app/api/shoppingList/member/remove/route";
import { POST as itemCreateHandler } from "@/src/app/api/shoppingList/item/create/route";
import { PUT as itemResolveHandler } from "@/src/app/api/shoppingList/item/resolve/route";
import { PUT as itemUpdateHandler } from "@/src/app/api/shoppingList/item/update/route";
import { DELETE as itemDeleteHandler } from "@/src/app/api/shoppingList/item/delete/route";
import { DELETE as shoppingListDeleteHandler } from "@/src/app/api/shoppingList/delete/route";
// Jest mockování dbConnect
jest.mock("@/src/utils/dbConnect", () => jest.fn());

// MongoMemoryServer pro testovací databázi
let mongoServer;
let userId;
let shoppingList;
let userId2;
let itemId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Mock připojení k databázi
  dbConnect.mockResolvedValueOnce();
  await mongoose.connect(uri, {});
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Shopping List Endpoints", () => {
  describe("User create", () => {
    it("should return email is required", async () => {
      const requestBody = {
        name: "Test User",
      };
      const request = new NextRequest("http://localhost:3000/api/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const response = await userHandler(request);
      const jsonData = await response.json();
      expect(response.status).toBe(400);
      expect(jsonData.error).toBe(
        "User validation failed: email: Path `email` is required."
      );
    });
    it("should return name is required", async () => {
      const requestBody = {
        email: "testuser@emial.cz",
      };
      const request = new NextRequest("http://localhost:3000/api/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const response = await userHandler(request);
      const jsonData = await response.json();
      expect(response.status).toBe(400);
      expect(jsonData.error).toBe(
        "User validation failed: name: Path `name` is required."
      );
    });
    it("should create a new user", async () => {
      const requestBody = {
        name: "Test User",
        email: "testuser@email.cz",
      };
      const request = new NextRequest("http://localhost:3000/api/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const response = await userHandler(request);
      const jsonData = await response.json();
      userId = jsonData._id;

      expect(response.status).toBe(201);
    });
    it("should create one more test user", async () => {
      const requestBody = {
        name: "Test User2",
        email: "testuser2@email.cz",
      };
      const request = new NextRequest("http://localhost:3000/api/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const response = await userHandler(request);
      const jsonData = await response.json();
      userId2 = jsonData._id;

      expect(response.status).toBe(201);
    });
  });
  describe("ShoppingList", () => {
    it("should create a new ShoppingList", async () => {
      const requestBody = {
        name: "Název seznamu",
        members: [],
        items: [
          { name: "Položka 1", quantity: "2 ks" },
          { name: "Položka 2", quantity: "100g" },
        ],
        userId: userId,
      };
      const request = new NextRequest(
        "http://localhost:3000/api/shoppingList/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await shoppingListCreateHandler(request);
      const jsonData = await response.json();
      shoppingList = jsonData;
      // Ověření odpovědi
      expect(response.status).toBe(201);
    });
    it("should try to create a new ShoppingList, but return error about name", async () => {
      const requestBody = {
        members: [],
        items: [
          { name: "Položka 1", quantity: "2 ks" },
          { name: "Položka 2", quantity: "100g" },
        ],
        userId: userId,
      };
      const request = new NextRequest(
        "http://localhost:3000/api/shoppingList/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await shoppingListCreateHandler(request);
      const jsonData = await response.json();
      // Ověření odpovědi
      expect(response.status).toBe(400);
      expect(jsonData.message).toBe(
        "Name is required to create a shopping list"
      );
    });
    it("should update existing ShoppingList", async () => {
      const requestBody = {
        id: shoppingList._id,
        name: "Updated Název seznamu",
        members: [],
        items: [
          {
            name: "Položka 1",
            quantity: "2 ks",
            status: "completed",
            _id: shoppingList.items[0]._id,
          },
        ],
        userId: userId,
      };

      const request = new NextRequest(
        "http://localhost:3000/api/shoppingList/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await shoppingListUpdateHandler(request);

      const jsonData = await response.json();

      shoppingList = jsonData;
      // Ověření odpovědi
      expect(response.status).toBe(200);
    });
    it("should try to update existing ShoppingList without id of shoppingList", async () => {
      const requestBody = {
        name: "Updated Název seznamu",
        members: [],
        items: [
          {
            name: "Položka 1",
            quantity: "2 ks",
            status: "completed",
            _id: shoppingList.items[0]._id,
          },
        ],
        userId: userId,
      };

      const request = new NextRequest(
        "http://localhost:3000/api/shoppingList/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await shoppingListUpdateHandler(request);

      const jsonData = await response.json();

      // Ověření odpovědi
      expect(response.status).toBe(400);
      expect(jsonData.message).toBe("Shopping list ID is required");
    });
    it("should return detail of shoppingList", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/shoppingList/detail?id=" +
          shoppingList._id +
          "&userId=" +
          userId,
        {
          method: "GET",
        }
      );

      const response = await shoppingListDetailHandler(request);

      // Ověření odpovědi
      expect(response.status).toBe(200);
    });
    it("should try to detail of shoppingList with invalid shoppingListId", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/shoppingList/detail?id=xxx" +
          "&userId=" +
          userId,
        {
          method: "GET",
        }
      );

      const response = await shoppingListDetailHandler(request);

      // Ověření odpovědi
      expect(response.status).toBe(500);
    });
  });
  describe("Member", () => {
    it("should add a member to the shopping list", async () => {
      const requestBody = {
        userId: userId,
        shoppingListId: shoppingList._id,
        memberId: userId2,
      };
      const request = new NextRequest(
        "http://localhost:3000/api/shoppingList/member/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await memberAddHandler(request);

      // Ověření odpovědi
      expect(response.status).toBe(200);
    });
    it("should try add a member to the shopping list, with unexisting userId", async () => {
      const requestBody = {
        userId: "userId",
        shoppingListId: shoppingList._id,
        memberId: userId2,
      };
      const request = new NextRequest(
        "http://localhost:3000/api/shoppingList/member/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await memberAddHandler(request);

      // Ověření odpovědi
      expect(response.status).toBe(500);
    });
    it("should remove a member from the shopping list - memberhimself", async () => {
      const requestBody = {
        userId: userId2,
        shoppingListId: shoppingList._id,
        memberId: userId2,
      };
      const request = new NextRequest(
        "http://localhost:3000/api/shoppingList/member/remove",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await memberRemoveHandler(request);

      // Ověření odpovědi
      expect(response.status).toBe(200);
    });
    it("should again add member to shoppingList for future tests", async () => {
      const requestBody = {
        userId: userId,
        shoppingListId: shoppingList._id,
        memberId: userId2,
      };
      const request = new NextRequest(
        "http://localhost:3000/api/shoppingList/member/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await memberAddHandler(request);

      // Ověření odpovědi
      expect(response.status).toBe(200);
    });
  });
  describe("Item", () => {
    it("should add item to existing shoppingList as owner", async () => {
      const requestBody = {
        shoppingListId: shoppingList._id,
        name: "Mléko",
        quantity: "200ml",
        userId: userId,
      };
      const request = new NextRequest(
        "http://localhost:3000/api/shoppingList/item/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await itemCreateHandler(request);
      const responseJson = await response.json();
      itemId = responseJson._id;
      // Ověření odpovědi
      expect(response.status).toBe(201);
    });
    it("should add item to existing shoppingList as member", async () => {
      const requestBody = {
        shoppingListId: shoppingList._id,
        name: "Banán",
        quantity: "2ks",
        userId: userId2,
      };
      const request = new NextRequest(
        "http://localhost:3000/api/shoppingList/item/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await itemCreateHandler(request);

      // Ověření odpovědi
      expect(response.status).toBe(201);
    });
    it("should try to add item to existing shoppingList as nonmember and not owner user", async () => {
      const requestBody = {
        shoppingListId: shoppingList._id,
        name: "Banán",
        quantity: "2ks",
        userId: "userId",
      };
      const request = new NextRequest(
        "http://localhost:3000/api/shoppingList/item/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await itemCreateHandler(request);

      // Ověření odpovědi
      expect(response.status).toBe(500);
    });
    it("should resolve item in shoppingList where user is owner", async () => {
      const requestBody = {
        itemId: itemId,
        shoppingListId: shoppingList._id,
        status: "completed",
        userId: userId,
      };
      const request = new NextRequest(
        "http://localhost:3000/api/shoppingList/item/resolve",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await itemResolveHandler(request);

      // Ověření odpovědi
      expect(response.status).toBe(200);
    });
    it("should resolve back item in shoppingList where user is member", async () => {
      const requestBody = {
        itemId: itemId,
        shoppingListId: shoppingList._id,
        status: "pending",
        userId: userId2,
      };
      const request = new NextRequest(
        "http://localhost:3000/api/shoppingList/item/resolve",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await itemResolveHandler(request);

      // Ověření odpovědi
      expect(response.status).toBe(200);
    });

    it("should update item in shoppingList where user is member", async () => {
      const requestBody = {
        itemId: itemId,
        shoppingListId: shoppingList._id,
        status: "completed",
        name: "brambory",
        quantity: "1kg",
        userId: userId2,
      };
      const request = new NextRequest(
        "http://localhost:3000/api/shoppingList/item/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await itemUpdateHandler(request);

      // Ověření odpovědi
      expect(response.status).toBe(200);
    });
    it("should update item in shoppingList where user is owner", async () => {
      const requestBody = {
        itemId: itemId,
        shoppingListId: shoppingList._id,
        status: "pending",
        name: "kaše",

        userId: userId,
      };
      const request = new NextRequest(
        "http://localhost:3000/api/shoppingList/item/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await itemUpdateHandler(request);

      // Ověření odpovědi
      expect(response.status).toBe(200);
    });
  });
  describe("Delete Endpoints", () => {
    it("should delete item from shoppingList", async () => {
      const requestBody = {
        itemId: itemId,
        shoppingListId: shoppingList._id,
        userId: userId,
      };
      const request = new NextRequest(
        "http://localhost:3000/api/shoppingList/item/delete",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await itemDeleteHandler(request);

      // Ověření odpovědi
      expect(response.status).toBe(200);
    });
    it("should try to delete shoppingList using member", async () => {
      const requestBody = {
        id: shoppingList._id,
        userId: userId2,
      };
      const request = new NextRequest(
        "http://localhost:3000/api/shoppingList/item/delete",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await shoppingListDeleteHandler(request);

      // Ověření odpovědi
      expect(response.status).toBe(400);
    });
    it("should delete shoppingList using owner", async () => {
      const requestBody = {
        id: shoppingList._id,
        userId: userId,
      };
      const request = new NextRequest(
        "http://localhost:3000/api/shoppingList/item/delete",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const response = await shoppingListDeleteHandler(request);

      // Ověření odpovědi
      expect(response.status).toBe(200);
    });
  });
});
