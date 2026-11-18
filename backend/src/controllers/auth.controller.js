import User from "../models/users.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function registerUser(req, res) {
  try {
    const { name, email, password, phone, role } = req.body;

    // Prevent public registration as admin
    const assignedRole = (role === "admin") ? "salesRepresentative" : (role || "salesRepresentative");

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, phone, role: assignedRole });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({ message: "User registered successfully", user: userObj, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({ message: "Login successful", user: userObj, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password").populate("assignedWarehouses");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function logoutUser(req, res) {
  res.clearCookie("token");
  return res.status(200).json({ message: "Logged out successfully" });
}
