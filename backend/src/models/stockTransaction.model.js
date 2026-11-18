import mongoose from "mongoose";

const stockTransactionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
  transactionType: { type: String, enum: ["stock-in", "stock-out"], required: true },
  quantity: { type: Number, required: true, min: 1 },
  note: { type: String },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

const StockTransaction = mongoose.model("StockTransaction", stockTransactionSchema);
export default StockTransaction;
