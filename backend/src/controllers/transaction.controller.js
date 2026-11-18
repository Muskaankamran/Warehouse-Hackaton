import StockTransaction from "../models/stockTransaction.model.js";
import Warehouse from "../models/warehouse.model.js";

// GET /api/transactions
export async function getTransactions(req, res) {
  try {
    const { warehouseId, productId, type, limit = 100 } = req.query;
    const filter = {};
    if (warehouseId) filter.warehouse = warehouseId;
    if (productId) filter.product = productId;
    if (type) filter.transactionType = type;

    // Warehouse managers see only their warehouses
    if (req.user.role === "warehouseManager") {
      const warehouses = await Warehouse.find({ manager: req.user.id });
      const ids = warehouses.map(w => w._id);
      filter.warehouse = { $in: ids };
    }

    const transactions = await StockTransaction.find(filter)
      .sort({ date: -1 })
      .limit(Number(limit))
      .populate("product", "name sku")
      .populate("warehouse", "name")
      .populate("performedBy", "name role");

    return res.status(200).json({ transactions });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}
