import mongoose from "mongoose";
import { testDbConnect, testDbDisconnect } from "@/src/utils/testDbConnect";

describe("Database Connection", () => {
  beforeAll(async () => {
    // Připojení k databázi před spuštěním testů
    await testDbConnect();
  });

  afterAll(async () => {
    // Odpojení od databáze po dokončení testů
    await testDbDisconnect();
  });

  it("should establish a connection to the database", async () => {
    // Kontrola, zda je mongoose připojeno k databázi
    expect(mongoose.connection.readyState).toBe(1); // 1 = Connected
  });

  it("should disconnect from the database", async () => {
    await testDbDisconnect();
    expect(mongoose.connection.readyState).toBe(0); // 0 = Disconnected
  });
});
