import mongoose from "mongoose";

// Funkce pro získání aktuálního času přizpůsobeného českému časovému pásmu
function getCzechTime() {
  const now = new Date();
  const utcOffset = now.getTimezoneOffset(); // v minutách
  const gmtPlusOneOffset = +120; // GMT+1 je o 60 minut před UTC
  const czechTime = new Date(
    now.getTime() + (gmtPlusOneOffset + utcOffset) * 60000
  );
  return czechTime;
}

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    token: {
      type: String,
      default: null, // Pole pro ukládání aktuálního tokenu uživatele
    },
    createdAt: {
      type: Date,
      default: getCzechTime, // Použití funkce pro český čas
    },
    updatedAt: {
      type: Date,
      default: getCzechTime, // Použití funkce pro český čas
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }, // Automatické spravování `createdAt` a `updatedAt`
  }
);

// Pre-save hook pro aktualizaci pole `updatedAt` na aktuální český čas
UserSchema.pre("save", function (next) {
  this.updatedAt = getCzechTime();
  next();
});

UserSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
