import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  sku: { type: String, unique: true, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  lowStockLimit: { type: Number, default: 10 },
  imageUrl: { type: String },
  imageFileId: { type: String },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
export default Product;
