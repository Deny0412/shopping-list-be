import mongoose from "mongoose";

const ShoppingListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Přidání reference na kolekci User
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    items: [
      {
        name: String,
        quantity: Number,
        status: {
          type: String,
          default: "pending",
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }, // Automatická správa `createdAt` a `updatedAt`
  }
);

// Přidání indexu na `ownerId` pro optimalizaci dotazů
ShoppingListSchema.index({ ownerId: 1 });

export default mongoose.models.ShoppingList ||
  mongoose.model("ShoppingList", ShoppingListSchema);
