import SupplyRequest from "../models/supplyRequest.model.js";
import Stock from "../models/stock.model.js";
import StockTransaction from "../models/stockTransaction.model.js";

// POST /api/supply-requests
export async function createSupplyRequest(req, res) {
  try {
    const { productId, warehouseId, quantity, note } = req.body;

    const request = await SupplyRequest.create({
      supplier: req.user.id,
      product: productId,
      warehouse: warehouseId,
      quantity,
      note,
    });

    return res.status(201).json({ message: "Supply request submitted", request });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

// GET /api/supply-requests
export async function getSupplyRequests(req, res) {
  try {
    const filter = {};

    // Suppliers see only their own requests
    if (req.user.role === "supplier") {
      filter.supplier = req.user.id;
    }

    const requests = await SupplyRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate("supplier", "name email")
      .populate("product", "name sku")
      .populate("warehouse", "name")
      .populate("reviewedBy", "name");

    return res.status(200).json({ requests });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

// PUT /api/supply-requests/:id/status — Admin approves/rejects
export async function updateSupplyRequestStatus(req, res) {
  try {
    const { status } = req.body;
    const request = await SupplyRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.status !== "Pending") {
      return res.status(400).json({ message: "Request has already been reviewed" });
    }

    request.status = status;
    request.reviewedBy = req.user.id;
    await request.save();

    // If approved, add stock automatically
    if (status === "Approved") {
      await Stock.findOneAndUpdate(
        { product: request.product, warehouse: request.warehouse },
        { $inc: { quantity: request.quantity } },
        { upsert: true, new: true }
      );

      await StockTransaction.create({
        product: request.product,
        warehouse: request.warehouse,
        transactionType: "stock-in",
        quantity: request.quantity,
        note: `Supply request approved`,
        performedBy: req.user.id,
      });
    }

    return res.status(200).json({ message: `Request ${status}`, request });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}
