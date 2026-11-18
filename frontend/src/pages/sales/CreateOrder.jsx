import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function CreateOrder() {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [stock, setStock] = useState([]);
  const [form, setForm] = useState({ customerName: "", customerPhone: "", warehouseId: "", items: [] });
  const [selectedProduct, setSelectedProduct] = useState("");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/warehouses").then(r => setWarehouses(r.data.warehouses)).catch(console.error);
    api.get("/products").then(r => setProducts(r.data.products)).catch(console.error);
  }, []);

  useEffect(() => {
    if (form.warehouseId) {
      api.get(`/stock?warehouseId=${form.warehouseId}`).then(r => setStock(r.data.stock)).catch(console.error);
    }
  }, [form.warehouseId]);

  const getAvailableQty = (productId) => {
    const s = stock.find(s => s.product?._id === productId || s.product === productId);
    return s?.quantity || 0;
  };

  const addItem = () => {
    if (!selectedProduct || qty < 1) return;
    const product = products.find(p => p._id === selectedProduct);
    const avail = getAvailableQty(selectedProduct);
    if (qty > avail) { setError(`Only ${avail} units available`); return; }

    // Check if already in list
    const existing = form.items.find(i => i.productId === selectedProduct);
    if (existing) {
      setForm({ ...form, items: form.items.map(i => i.productId === selectedProduct ? { ...i, quantity: i.quantity + qty } : i) });
    } else {
      setForm({ ...form, items: [...form.items, { productId: selectedProduct, quantity: qty, price: product.price, name: product.name }] });
    }
    setSelectedProduct(""); setQty(1); setError("");
  };

  const removeItem = (productId) => setForm({ ...form, items: form.items.filter(i => i.productId !== productId) });

  const totalAmount = form.items.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (form.items.length === 0) { setError("Add at least one product"); return; }
    setLoading(true);
    try {
      const res = await api.post("/orders", {
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        warehouseId: form.warehouseId,
        products: form.items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
      });
      setSuccess(`✅ Order ${res.data.order.orderNumber} created!`);
      setTimeout(() => navigate("/sales/orders"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Error creating order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>🛒 Create Sales Order</h1>
      </div>
      <div className="card form-card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Customer Name</label>
              <input className="form-input" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} required placeholder="Customer name" />
            </div>
            <div className="form-group">
              <label>Customer Phone</label>
              <input className="form-input" value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })} placeholder="+92 300..." />
            </div>
          </div>

          <div className="form-group">
            <label>Warehouse</label>
            <select className="form-input" value={form.warehouseId} onChange={e => setForm({ ...form, warehouseId: e.target.value, items: [] })} required>
              <option value="">Select Warehouse</option>
              {warehouses.map(w => <option key={w._id} value={w._id}>{w.name} — {w.location}</option>)}
            </select>
          </div>

          {form.warehouseId && (
            <div className="add-product-row">
              <select className="form-input" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                <option value="">Select Product</option>
                {products.map(p => {
                  const avail = getAvailableQty(p._id);
                  return <option key={p._id} value={p._id}>{p.name} — Rs.{p.price} (Available: {avail})</option>;
                })}
              </select>
              <input type="number" className="form-input qty-input" value={qty} min="1" onChange={e => setQty(Number(e.target.value))} />
              <button type="button" className="btn btn-secondary" onClick={addItem}>+ Add</button>
            </div>
          )}

          {form.items.length > 0 && (
            <div className="order-items">
              <table className="table">
                <thead>
                  <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Line Total</th><th></th></tr>
                </thead>
                <tbody>
                  {form.items.map(item => (
                    <tr key={item.productId}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>Rs. {item.price?.toLocaleString()}</td>
                      <td><strong>Rs. {(item.price * item.quantity).toLocaleString()}</strong></td>
                      <td><button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(item.productId)}>✕</button></td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td colSpan={3}><strong>Grand Total</strong></td>
                    <td colSpan={2}><strong>Rs. {totalAmount.toLocaleString()}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading || form.items.length === 0}>
            {loading ? "Creating Order..." : "🛒 Create Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
