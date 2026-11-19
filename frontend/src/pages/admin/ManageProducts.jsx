import { useEffect, useState } from "react";
import api from "../../api/axios";
import Modal from "../../components/Modal";
import ImageUpload from "../../components/ImageUpload";
import { confirmAction, showErrorAlert, showSuccessAlert } from "../../utils/alerts";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [form, setForm] = useState({ name: "", description: "", sku: "", category: "", price: "", lowStockLimit: 10, supplier: "", imageUrl: "", imageFileId: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProducts = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    api.get(`/products?${params}`).then(r => setProducts(r.data.products)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [search, category]);
  useEffect(() => {
    api.get("/users?role=supplier").then(r => setSuppliers(r.data.users)).catch(console.error);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", sku: "", category: "", price: "", lowStockLimit: 10, supplier: "", imageUrl: "", imageFileId: "" });
    setError(""); setSuccess("");
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || "", sku: p.sku, category: p.category, price: p.price, lowStockLimit: p.lowStockLimit, supplier: p.supplier?._id || "", imageUrl: p.imageUrl || "", imageFileId: p.imageFileId || "" });
    setError(""); setSuccess("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      if (editing) {
        await api.put(`/products/${editing._id}`, form);
        setSuccess("Product updated!");
      } else {
        await api.post("/products", form);
        setSuccess("Product created!");
      }
      fetchProducts();
      setTimeout(() => setShowModal(false), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Error");
    }
  };

  const handleDelete = async (id) => {
    if (!await confirmAction("Delete product?", "This product will be permanently removed.", "Delete product")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
      showSuccessAlert("Product deleted", "The product has been removed.");
    } catch (err) {
      showErrorAlert("Unable to delete product", err.response?.data?.message || "Please try again.");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Manage Products</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
      </div>

      <div className="filters">
        <input className="form-input filter-input" placeholder="🔍 Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-input filter-select" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {[...new Set(products.map(p => p.category))].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="product-grid">
        {loading ? <div className="spinner-center"><div className="spinner"></div></div> :
          products.length === 0 ? <div className="empty">No products found</div> :
          products.map(p => (
            <div key={p._id} className="product-card">
              {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="product-img" /> : <div className="product-img-placeholder">📦</div>}
              <div className="product-info">
                <div className="product-name">{p.name}</div>
                <div className="product-sku">SKU: {p.sku}</div>
                <div className="product-category">{p.category}</div>
                <div className="product-price">Rs. {p.price?.toLocaleString()}</div>
                {p.supplier && <div className="product-supplier">Supplier: {p.supplier.name}</div>}
              </div>
              <div className="product-actions">
                <button className="btn btn-sm btn-secondary" onClick={() => openEdit(p)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id)}>Delete</button>
              </div>
            </div>
          ))
        }
      </div>

      {showModal && (
        <Modal title={editing ? "Edit Product" : "Add Product"} onClose={() => setShowModal(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>SKU</label>
                <input className="form-input" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <input className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Price (Rs.)</label>
                <input type="number" className="form-input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required min="0" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Low Stock Limit</label>
                <input type="number" className="form-input" value={form.lowStockLimit} onChange={e => setForm({ ...form, lowStockLimit: e.target.value })} min="0" />
              </div>
              <div className="form-group">
                <label>Supplier</label>
                <select className="form-input" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })}>
                  <option value="">None</option>
                  {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Product Image (ImageKit)</label>
              <ImageUpload
                folder="products"
                currentImage={form.imageUrl}
                onUpload={({ url, fileId }) => setForm({ ...form, imageUrl: url, imageFileId: fileId })}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full">{editing ? "Update Product" : "Create Product"}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
