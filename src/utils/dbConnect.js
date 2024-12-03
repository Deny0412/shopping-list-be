///ORIGINAL

/* import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

async function dbConnect() {
  try {
    // Otevře nové připojení bez použití cache
    const connection = await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
    return connection;
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    throw new Error("Database connection failed");
  }
}

export default dbConnect; */

///TESTING

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

const MONGODB_URI = process.env.MONGODB_URI;

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection.asPromise();
  }

  if (process.env.NODE_ENV === "test") {
    // Použití mongodb-memory-server při testování
    if (!mongoServer) {
      mongoServer = await MongoMemoryServer.create();
    }
    const testUri = mongoServer.getUri();
    return mongoose.connect(testUri);
    console.log("Connected to MongoDB");
  }

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  // Připojení na produkční/staging databázi
  return mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

async function dbDisconnect() {
  if (process.env.NODE_ENV === "test" && mongoServer) {
    await mongoose.disconnect();
    await mongoServer.stop();
  } else {
    await mongoose.disconnect();
  }
}

export default dbConnect;
export { dbDisconnect };
