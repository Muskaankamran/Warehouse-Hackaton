import Stock from "../models/stock.model.js";
import StockTransaction from "../models/stockTransaction.model.js";
import Product from "../models/product.model.js";
import Warehouse from "../models/warehouse.model.js";

// POST /api/stock/in — Stock In
export async function stockIn(req, res) {
  try {
    const { productId, warehouseId, quantity, note } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be positive" });
    }

    // Check warehouse manager is assigned to warehouse
    if (req.user.role === "warehouseManager") {
      const warehouse = await Warehouse.findById(warehouseId);
      if (!warehouse || warehouse.manager?.toString() !== req.user.id) {
        return res.status(403).json({ message: "You are not assigned to this warehouse" });
      }
    }

    // Upsert stock record
    let stock = await Stock.findOneAndUpdate(
      { product: productId, warehouse: warehouseId },
      { $inc: { quantity } },
      { upsert: true, new: true }
    );

    // Create transaction record
    await StockTransaction.create({
      product: productId,
      warehouse: warehouseId,
      transactionType: "stock-in",
      quantity,
      note,
      performedBy: req.user.id,
    });

    return res.status(200).json({ message: "Stock added successfully", stock });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

// POST /api/stock/out — Stock Out
export async function stockOut(req, res) {
  try {
    const { productId, warehouseId, quantity, note } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be positive" });
    }

    if (req.user.role === "warehouseManager") {
      const warehouse = await Warehouse.findById(warehouseId);
      if (!warehouse || warehouse.manager?.toString() !== req.user.id) {
        return res.status(403).json({ message: "You are not assigned to this warehouse" });
      }
    }

    const stock = await Stock.findOne({ product: productId, warehouse: warehouseId });
    if (!stock || stock.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock", available: stock?.quantity || 0 });
    }

    stock.quantity -= quantity;
    await stock.save();

    await StockTransaction.create({
      product: productId,
      warehouse: warehouseId,
      transactionType: "stock-out",
      quantity,
      note,
      performedBy: req.user.id,
    });

    return res.status(200).json({ message: "Stock removed successfully", stock });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

// GET /api/stock — View inventory
export async function getStock(req, res) {
  try {
    const { warehouseId, productId } = req.query;
    const filter = {};
    if (warehouseId) filter.warehouse = warehouseId;
    if (productId) filter.product = productId;

    // Warehouse managers see only their warehouses
    if (req.user.role === "warehouseManager") {
      const warehouses = await Warehouse.find({ manager: req.user.id });
      const ids = warehouses.map(w => w._id);
      filter.warehouse = { $in: ids };
    }

    const stock = await Stock.find(filter)
      .populate("product", "name sku category price imageUrl lowStockLimit")
      .populate("warehouse", "name location");
    return res.status(200).json({ stock });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

// GET /api/stock/low — Low stock items
export async function getLowStock(req, res) {
  try {
    const allStock = await Stock.find()
      .populate("product", "name sku category price imageUrl lowStockLimit")
      .populate("warehouse", "name location");

    const lowStock = allStock.filter(s => s.product && s.quantity <= s.product.lowStockLimit);
    return res.status(200).json({ lowStock });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}
