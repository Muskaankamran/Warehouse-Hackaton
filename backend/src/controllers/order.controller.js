import Order from "../models/order.model.js";
import Stock from "../models/stock.model.js";
import StockTransaction from "../models/stockTransaction.model.js";

// POST /api/orders — Create sales order
export async function createOrder(req, res) {
  try {
    const { customerName, customerPhone, warehouseId, products } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Order must have at least one product" });
    }

    // Validate stock availability for all products
    let totalAmount = 0;
    const orderProducts = [];

    for (const item of products) {
      const stock = await Stock.findOne({ product: item.productId, warehouse: warehouseId })
        .populate("product", "name price");

      if (!stock || stock.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product`,
          available: stock?.quantity || 0,
          productId: item.productId,
        });
      }

      const price = item.price || stock.product.price;
      totalAmount += price * item.quantity;

      orderProducts.push({
        product: item.productId,
        quantity: item.quantity,
        price,
      });
    }

    const order = await Order.create({
      customerName,
      customerPhone,
      warehouse: warehouseId,
      products: orderProducts,
      totalAmount,
      createdBy: req.user.id,
      status: "Pending",
    });

    return res.status(201).json({ message: "Order created", order });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

// GET /api/orders
export async function getOrders(req, res) {
  try {
    const { status, warehouseId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (warehouseId) filter.warehouse = warehouseId;

    // Sales reps see only their own orders
    if (req.user.role === "salesRepresentative") {
      filter.createdBy = req.user.id;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("products.product", "name sku price imageUrl")
      .populate("warehouse", "name location")
      .populate("createdBy", "name");

    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

// GET /api/orders/:id
export async function getOrderById(req, res) {
  try {
    const order = await Order.findById(req.params.id)
      .populate("products.product", "name sku price imageUrl")
      .populate("warehouse", "name location")
      .populate("createdBy", "name email");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Sales rep can only view their own order
    if (req.user.role === "salesRepresentative" && order.createdBy?._id?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json({ order });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}

// PUT /api/orders/:id/status — Update order status
export async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status === "Completed" || order.status === "Cancelled") {
      return res.status(400).json({ message: `Cannot update a ${order.status} order` });
    }

    // Deduct stock only when transitioning to Processing for the first time
    if (status === "Processing" && !order.stockDeducted) {
      for (const item of order.products) {
        const stock = await Stock.findOne({ product: item.product, warehouse: order.warehouse });
        if (!stock || stock.quantity < item.quantity) {
          return res.status(400).json({
            message: "Insufficient stock to process order",
            productId: item.product,
            available: stock?.quantity || 0,
          });
        }
        stock.quantity -= item.quantity;
        await stock.save();

        await StockTransaction.create({
          product: item.product,
          warehouse: order.warehouse,
          transactionType: "stock-out",
          quantity: item.quantity,
          note: `Order ${order.orderNumber} processed`,
          performedBy: req.user.id,
        });
      }
      order.stockDeducted = true;
    }

    order.status = status;
    await order.save();

    return res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

// PUT /api/orders/:id/cancel — Cancel order
export async function cancelOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Sales rep can only cancel their own orders
    if (req.user.role === "salesRepresentative" && order.createdBy?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (order.status !== "Pending") {
      return res.status(400).json({ message: "Only Pending orders can be cancelled" });
    }

    order.status = "Cancelled";
    await order.save();

    return res.status(200).json({ message: "Order cancelled", order });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}
