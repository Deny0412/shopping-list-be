import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

export const testDbConnect = async () => {
  mongoServer = await MongoMemoryServer.create(); // Vytvoření dočasné MongoDB instance
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

export const testDbDisconnect = async () => {
  if (mongoServer) {
    await mongoose.disconnect();
    await mongoServer.stop(); // Ukončení testovací databáze
  }
};
