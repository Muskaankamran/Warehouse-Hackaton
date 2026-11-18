import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function SubmitRequest() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({ productId: "", warehouseId: "", quantity: "", note: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/products?supplier=${user._id}`).then(r => setProducts(r.data.products)).catch(console.error);
    api.get("/warehouses").then(r => setWarehouses(r.data.warehouses)).catch(console.error);
  }, [user._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      await api.post("/supply-requests", { ...form, quantity: Number(form.quantity) });
      setSuccess("✅ Supply request submitted successfully!");
      setForm({ productId: "", warehouseId: "", quantity: "", note: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Error submitting request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Submit Supply Request</h1>
      </div>
      <div className="card form-card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Product</label>
            <select className="form-input" value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })} required>
              <option value="">Select Product</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name} (SKU: {p.sku})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Destination Warehouse</label>
            <select className="form-input" value={form.warehouseId} onChange={e => setForm({ ...form, warehouseId: e.target.value })} required>
              <option value="">Select Warehouse</option>
              {warehouses.map(w => <option key={w._id} value={w._id}>{w.name} — {w.location}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input type="number" className="form-input" value={form.quantity} min="1" onChange={e => setForm({ ...form, quantity: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Note</label>
            <textarea className="form-input" rows={2} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Submitting..." : "📝 Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
