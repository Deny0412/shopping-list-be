import mongoose from "mongoose";
//import moment from "moment-timezone";

// Function to get the current time adjusted to Czech timezone using moment-timezone
function getCzechTime() {
  const now = new Date();

  // Získání aktuálního UTC času
  const utcOffset = now.getTimezoneOffset(); // v minutách

  // Časový posun pro GMT+1
  const gmtPlusOneOffset = +120; // GMT+1 je o 60 minut před UTC

  // Vypočítání aktuálního času v GMT+1
  const czechTime = new Date(
    now.getTime() + (gmtPlusOneOffset + utcOffset) * 60000
  );

  return czechTime; // Vrátí objekt Date
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
    createdAt: {
      type: Date,
      default: getCzechTime(), // Use function reference
    },
    updatedAt: {
      type: Date,
      default: getCzechTime(), // Use function reference
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }, // Automatically manage `createdAt` and `updatedAt`
  }
);

// Pre-save hook to update `updatedAt` field to current Czech time
UserSchema.pre("save", function (next) {
  this.updatedAt = getCzechTime(); // Update to current Czech time
  console.log("Updated at: ", this.updatedAt);
  next();
});

UserSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
