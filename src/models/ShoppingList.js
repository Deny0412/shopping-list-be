import mongoose from "mongoose";
import ItemSchema from "./Item"; // Import the Item schema

function getCzechTime() {
  const now = new Date();
  const utcOffset = now.getTimezoneOffset(); // in minutes
  const gmtPlusOneOffset = +120; // GMT+1 is 60 minutes ahead of UTC
  const czechTime = new Date(
    now.getTime() + (gmtPlusOneOffset + utcOffset) * 60000
  );
  return czechTime;
}

const ShoppingListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Reference to User collection
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    items: [ItemSchema], // Use the imported ItemSchema
    createdAt: {
      type: Date,
      default: getCzechTime,
    },
    updatedAt: {
      type: Date,
      default: getCzechTime,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }, // Automatic management of `createdAt` and `updatedAt`
  }
);

// Pre-save hook for updating `updatedAt` field to current Czech time
ShoppingListSchema.pre("save", function (next) {
  this.updatedAt = getCzechTime();
  next();
});

// Adding index on `ownerId` for query optimization
ShoppingListSchema.index({ ownerId: 1 });

export default mongoose.models.ShoppingList ||
  mongoose.model("ShoppingList", ShoppingListSchema);
