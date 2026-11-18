import User from "../models/users.model.js";
import Product from "../models/product.model.js";
import Warehouse from "../models/warehouse.model.js";
import Order from "../models/order.model.js";
import Stock from "../models/stock.model.js";
import StockTransaction from "../models/stockTransaction.model.js";
import SupplyRequest from "../models/supplyRequest.model.js";

// GET /api/dashboard/stats — Admin dashboard statistics
export async function getDashboardStats(req, res) {
  try {
    const [
      totalUsers, totalProducts, totalWarehouses,
      totalOrders, pendingOrders, totalTransactions,
      allStock, totalSupplyRequests
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Warehouse.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: "Pending" }),
      StockTransaction.countDocuments(),
      Stock.find().populate("product", "lowStockLimit"),
      SupplyRequest.countDocuments({ status: "Pending" }),
    ]);

    const lowStockCount = allStock.filter(s => s.product && s.quantity <= s.product.lowStockLimit).length;

    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    return res.status(200).json({
      stats: {
        totalUsers,
        totalProducts,
        totalWarehouses,
        totalOrders,
        pendingOrders,
        totalTransactions,
        lowStockCount,
        pendingSupplyRequests: totalSupplyRequests,
        usersByRole,
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}
