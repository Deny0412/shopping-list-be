import mongoose from "mongoose";

describe("Clear Test Database", () => {
  beforeAll(async () => {
    // Připojení k databázi
    const mongoUri = "mongodb://localhost:27017/test-db"; // Upravte URI podle potřeby
    await mongoose.connect(mongoUri, {});
  });

  afterAll(async () => {
    // Odpojení od databáze
    await mongoose.disconnect();
  });

  it("should clear all collections in the database", async () => {
    // Ověření, že databáze obsahuje kolekce
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    expect(collections.length).toBeGreaterThan(0);

    // Projděte všechny kolekce a odstraňte je
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).deleteMany({});
    }

    // Ověření, že všechny kolekce jsou prázdné
    for (const collection of collections) {
      const count = await mongoose.connection.db
        .collection(collection.name)
        .countDocuments();
      expect(count).toBe(0);
    }
  });
});
