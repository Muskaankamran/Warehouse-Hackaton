import { useEffect, useState } from "react";
import api from "../../api/axios";
import StatusBadge from "../../components/StatusBadge";

export default function ManagerInventory() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    api.get("/warehouses").then(r => setWarehouses(r.data.warehouses)).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = warehouseFilter ? `?warehouseId=${warehouseFilter}` : "";
    api.get(`/stock${params}`).then(r => setStock(r.data.stock)).catch(console.error).finally(() => setLoading(false));
  }, [warehouseFilter]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Warehouse Inventory</h1>
      </div>
      <div className="filters">
        <select className="form-input filter-select" value={warehouseFilter} onChange={e => setWarehouseFilter(e.target.value)}>
          <option value="">All My Warehouses</option>
          {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
        </select>
      </div>
      <div className="card">
        {loading ? <div className="spinner-center"><div className="spinner"></div></div> : (
          <table className="table">
            <thead>
              <tr><th>Product</th><th>SKU</th><th>Category</th><th>Warehouse</th><th>Price</th><th>Qty</th><th>Alert</th></tr>
            </thead>
            <tbody>
              {stock.map(s => {
                const isLow = s.product && s.quantity <= s.product.lowStockLimit;
                return (
                  <tr key={s._id} className={isLow ? "row-warning" : ""}>
                    <td>
                      {s.product?.imageUrl && <img src={s.product.imageUrl} className="table-thumb" alt="" />}
                      {s.product?.name}
                    </td>
                    <td>{s.product?.sku}</td>
                    <td>{s.product?.category}</td>
                    <td>{s.warehouse?.name}</td>
                    <td>Rs. {s.product?.price?.toLocaleString()}</td>
                    <td><strong style={{ color: isLow ? "#ef4444" : "inherit" }}>{s.quantity}</strong></td>
                    <td>{isLow ? "⚠️ Low" : "✅"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
