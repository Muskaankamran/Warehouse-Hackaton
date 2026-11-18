import Product from "../models/product.model.js";
import ImageKit from "@imagekit/nodejs";

const imagekit = new ImageKit({ privateKey: process.env.IMAGEKIT_PRIVATE_KEY });

// GET /api/products
export async function getProducts(req, res) {
  try {
    const { category, supplier, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (supplier) filter.supplier = supplier;
    if (search) filter.name = { $regex: search, $options: "i" };

    const products = await Product.find(filter)
      .populate("supplier", "name email")
      .populate("createdBy", "name");
    return res.status(200).json({ products });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

// GET /api/products/:id
export async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id)
      .populate("supplier", "name email")
      .populate("createdBy", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json({ product });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/products
export async function createProduct(req, res) {
  try {
    const { name, description, sku, category, price, lowStockLimit, supplier, imageUrl, imageFileId } = req.body;

    const existing = await Product.findOne({ sku });
    if (existing) return res.status(409).json({ message: "SKU already exists" });

    const product = await Product.create({
      name, description, sku, category, price, lowStockLimit,
      supplier, imageUrl, imageFileId, createdBy: req.user.id,
    });
    return res.status(201).json({ message: "Product created", product });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

// PUT /api/products/:id
export async function updateProduct(req, res) {
  try {
    const { name, description, sku, category, price, lowStockLimit, supplier, imageUrl, imageFileId } = req.body;
    const updateData = { name, description, sku, category, price, lowStockLimit, supplier, imageUrl, imageFileId };
    Object.keys(updateData).forEach(k => updateData[k] === undefined && delete updateData[k]);

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json({ message: "Product updated", product });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

// DELETE /api/products/:id
export async function deleteProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Delete from ImageKit if fileId exists
    if (product.imageFileId) {
      try {
        await imagekit.deleteFile(product.imageFileId);
      } catch (e) {
        console.error("ImageKit delete failed:", e.message);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}
