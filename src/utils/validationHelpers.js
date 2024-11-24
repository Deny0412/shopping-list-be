import User from "@/src/models/User";
import mongoose from "mongoose";

// Validates if a user exists based on their ID
export async function validateUserExists(userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error(`Invalid user ID: ${userId}`);
  }

  const userExists = await User.findById(userId);
  if (!userExists) {
    throw new Error(`User with ID ${userId} does not exist`);
  }
}
