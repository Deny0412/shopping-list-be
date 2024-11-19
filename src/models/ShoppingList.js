import mongoose from "mongoose";
function getCzechTime() {
  const now = new Date();
  const utcOffset = now.getTimezoneOffset(); // v minutách
  const gmtPlusOneOffset = +120; // GMT+1 je o 60 minut před UTC
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
        quantity: String,
        status: {
          type: String,
          default: "pending",
        },
      },
    ],
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
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }, // Automatická správa `createdAt` a `updatedAt`
  }
);
// Pre-save hook pro aktualizaci pole `updatedAt` na aktuální český čas
ShoppingListSchema.pre("save", function (next) {
  this.updatedAt = getCzechTime();
  next();
});
// Přidání indexu na `ownerId` pro optimalizaci dotazů
ShoppingListSchema.index({ ownerId: 1 });

export default mongoose.models.ShoppingList ||
  mongoose.model("ShoppingList", ShoppingListSchema);
