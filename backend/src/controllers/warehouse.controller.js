import Warehouse from "../models/warehouse.model.js";
import User from "../models/users.model.js";

// GET /api/warehouses

export async function getWarehouses(req, res) {
  try {
    let warehouses;

    if (req.user.role === "warehouseManager") {
      const user = await User.findById(req.user.id)
        .select("assignedWarehouses");

      const assignedIds = user?.assignedWarehouses || [];

      warehouses = await Warehouse.find({
        $or: [
          { manager: req.user.id },
          { _id: { $in: assignedIds } }
        ]
      }).populate("manager", "name email");

    } else {
      warehouses = await Warehouse.find()
        .populate("manager", "name email");
    }

    return res.status(200).json({ warehouses });

  } catch (error) {
    console.error("Get Warehouses Error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
}

// GET /api/warehouses/:id
export async function getWarehouseById(req, res) {
  try {
    const warehouse = await Warehouse.findById(req.params.id).populate("manager", "name email");
    if (!warehouse) return res.status(404).json({ message: "Warehouse not found" });
    return res.status(200).json({ warehouse });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/warehouses
export async function createWarehouse(req, res) {
  try {
    const { name, location, manager, capacity } = req.body;
    const warehouse = await Warehouse.create({ name, location, manager, capacity });

    // Also assign warehouse to manager user
    if (manager) {
      await User.findByIdAndUpdate(manager, {
        $addToSet: { assignedWarehouses: warehouse._id }
      });
    }

    return res.status(201).json({ message: "Warehouse created", warehouse });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

// PUT /api/warehouses/:id
export async function updateWarehouse(req, res) {
  try {
    const { name, location, manager, capacity } = req.body;
    const old = await Warehouse.findById(req.params.id);
    if (!old) return res.status(404).json({ message: "Warehouse not found" });

    // If manager changed, update user assignments
    if (manager && old.manager?.toString() !== manager) {
      if (old.manager) {
        await User.findByIdAndUpdate(old.manager, {
          $pull: { assignedWarehouses: old._id }
        });
      }
      await User.findByIdAndUpdate(manager, {
        $addToSet: { assignedWarehouses: old._id }
      });
    }

    const warehouse = await Warehouse.findByIdAndUpdate(
      req.params.id,
      { name, location, manager, capacity },
      { new: true }
    ).populate("manager", "name email");

    return res.status(200).json({ message: "Warehouse updated", warehouse });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

// DELETE /api/warehouses/:id
export async function deleteWarehouse(req, res) {
  try {
    const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
    if (!warehouse) return res.status(404).json({ message: "Warehouse not found" });
    return res.status(200).json({ message: "Warehouse deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}
