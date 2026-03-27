const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["employee", "agent", "admin"], default: "employee" },
  // Agents toggle this to go Online/Offline — offline agents cannot claim new tickets
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });


// Hash password before saving if provided
// NOTE: For auth flow manually hashing is easier, but if we do it here we shouldn't do it again in controller
userSchema.pre("save", async function () {
  if (!this.isModified("passwordHash")) return;
  if (!this.passwordHash.startsWith("$2a$") && !this.passwordHash.startsWith("$2b$")) {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  }
});

module.exports = mongoose.model("User", userSchema);
