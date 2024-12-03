import { testDbConnect, testDbDisconnect } from "@/src/utils/testDbConnect";
process.env.NODE_ENV = "test";
// Spuštění před všemi testy
beforeAll(async () => {
  await testDbConnect();
});

// Ukončení po všech testech
afterAll(async () => {
  await testDbDisconnect();
});

// Vymazání databáze mezi jednotlivými testy
afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});
