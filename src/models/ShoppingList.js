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
  },
  { versionKey: false }
);

export default mongoose.models.ShoppingList ||
  mongoose.model("ShoppingList", ShoppingListSchema);
