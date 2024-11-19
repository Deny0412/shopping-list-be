import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    shoppingListId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShoppingList",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: String,
      default: "1",
    },
    status: {
      type: String,
      default: "pending",
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    versionKey: false,
  }
);

// Přidání indexů
ItemSchema.index({ shoppingListId: 1 });
ItemSchema.index({ status: 1 });

export default mongoose.models.Item || mongoose.model("Item", ItemSchema);
