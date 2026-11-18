import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function StockIn() {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ productId: "", warehouseId: "", quantity: "", note: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/warehouses").then(r => setWarehouses(r.data.warehouses)).catch(console.error);
    api.get("/products").then(r => setProducts(r.data.products)).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (form.quantity <= 0) { setError("Quantity must be positive"); return; }
    setLoading(true);
    try {
      const res = await api.post("/stock/in", { ...form, quantity: Number(form.quantity) });
      setSuccess(`✅ Stock added! New quantity: ${res.data.stock.quantity}`);
      setForm({ productId: "", warehouseId: "", quantity: "", note: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Error adding stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>➕ Add Stock (Stock In)</h1>
      </div>
      <div className="card form-card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Warehouse</label>
            <select className="form-input" value={form.warehouseId} onChange={e => setForm({ ...form, warehouseId: e.target.value })} required>
              <option value="">Select Warehouse</option>
              {warehouses.map(w => <option key={w._id} value={w._id}>{w.name} — {w.location}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Product</label>
            <select className="form-input" value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })} required>
              <option value="">Select Product</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name} (SKU: {p.sku})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Quantity Received</label>
            <input type="number" className="form-input" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required min="1" placeholder="Enter quantity" />
          </div>
          <div className="form-group">
            <label>Note (optional)</label>
            <textarea className="form-input" rows={2} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="e.g. Received from supplier" />
          </div>
          <button type="submit" className="btn btn-success btn-full" disabled={loading}>
            {loading ? "Adding Stock..." : "➕ Add Stock"}
          </button>
        </form>
      </div>
    </div>
  );
}
