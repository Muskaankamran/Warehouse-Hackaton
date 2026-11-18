import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function StockOut() {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentStock, setCurrentStock] = useState(null);
  const [form, setForm] = useState({ productId: "", warehouseId: "", quantity: "", note: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/warehouses").then(r => setWarehouses(r.data.warehouses)).catch(console.error);
    api.get("/products").then(r => setProducts(r.data.products)).catch(console.error);
  }, []);

  // Load current stock when product+warehouse selected
  useEffect(() => {
    if (form.productId && form.warehouseId) {
      api.get(`/stock?productId=${form.productId}&warehouseId=${form.warehouseId}`)
        .then(r => setCurrentStock(r.data.stock[0] || null))
        .catch(() => setCurrentStock(null));
    }
  }, [form.productId, form.warehouseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      const res = await api.post("/stock/out", { ...form, quantity: Number(form.quantity) });
      setSuccess(`✅ Stock removed! Remaining: ${res.data.stock.quantity}`);
      setForm({ productId: "", warehouseId: "", quantity: "", note: "" });
      setCurrentStock(null);
    } catch (err) {
      setError(err.response?.data?.message || `Error. Available: ${err.response?.data?.available ?? "?"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>➖ Remove Stock (Stock Out)</h1>
      </div>
      <div className="card form-card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {currentStock && (
          <div className="stock-info-box">
            <span>📦 Current Stock: <strong>{currentStock.quantity} units</strong></span>
          </div>
        )}

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
            <label>Quantity to Remove</label>
            <input type="number" className="form-input" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required min="1"
              max={currentStock?.quantity || undefined} placeholder="Enter quantity" />
          </div>
          <div className="form-group">
            <label>Note (optional)</label>
            <textarea className="form-input" rows={2} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-danger btn-full" disabled={loading}>
            {loading ? "Removing..." : "➖ Remove Stock"}
          </button>
        </form>
      </div>
    </div>
  );
}
