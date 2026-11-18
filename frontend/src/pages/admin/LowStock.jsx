import { useEffect, useState } from "react";
import api from "../../api/axios";
import StatusBadge from "../../components/StatusBadge";

export default function LowStock() {
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/stock/low").then(r => setLowStock(r.data.lowStock)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>⚠️ Low Stock Alerts</h1>
        <p className="page-subtitle">Products below their low stock limit</p>
      </div>
      <div className="card">
        {loading ? <div className="spinner-center"><div className="spinner"></div></div> : lowStock.length === 0 ? (
          <div className="empty">✅ All products are well-stocked!</div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Product</th><th>SKU</th><th>Category</th><th>Warehouse</th><th>Current Qty</th><th>Low Stock Limit</th><th>Status</th></tr>
            </thead>
            <tbody>
              {lowStock.map(s => (
                <tr key={s._id} className="row-warning">
                  <td>
                    {s.product?.imageUrl && <img src={s.product.imageUrl} alt="" className="table-thumb" />}
                    {s.product?.name}
                  </td>
                  <td>{s.product?.sku}</td>
                  <td>{s.product?.category}</td>
                  <td>{s.warehouse?.name}</td>
                  <td><strong style={{ color: "#ef4444" }}>{s.quantity}</strong></td>
                  <td>{s.product?.lowStockLimit}</td>
                  <td><StatusBadge status="Pending" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
