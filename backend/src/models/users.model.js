import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: {
    type: String,
    enum: ["admin", "warehouseManager", "supplier", "salesRepresentative"],
    default: "salesRepresentative",
  },
  assignedWarehouses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" }],
  image: { type: String },
  imageFileId: { type: String },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
