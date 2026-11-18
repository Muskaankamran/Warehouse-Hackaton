import User from "../models/users.model.js";
import bcrypt from "bcryptjs";

// GET /api/users — Admin only
export async function getUsers(req, res) {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select("-password").populate("assignedWarehouses");
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

// GET /api/users/:id
export async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.id).select("-password").populate("assignedWarehouses");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/users — Admin creates user with any role
export async function createUser(req, res) {
  try {
    const { name, email, password, phone, role, assignedWarehouses } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const hash = await bcrypt.hash(password || "Password123!", 10);
    const user = await User.create({ name, email, password: hash, phone, role, assignedWarehouses });

    const userObj = user.toObject();
    delete userObj.password;
    return res.status(201).json({ message: "User created", user: userObj });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

// PUT /api/users/:id — Admin updates user
export async function updateUser(req, res) {
  try {
    const { name, email, phone, role, assignedWarehouses, image, imageFileId } = req.body;
    const updateData = { name, email, phone, role, assignedWarehouses, image, imageFileId };
    // Remove undefined fields
    Object.keys(updateData).forEach(k => updateData[k] === undefined && delete updateData[k]);

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ message: "User updated", user });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

// DELETE /api/users/:id — Admin
export async function deleteUser(req, res) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ message: "User deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}
