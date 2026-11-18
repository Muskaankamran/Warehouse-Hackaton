import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/StatCard";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/warehouses"),
      api.get("/stock"),
    ]).then(([wRes, sRes]) => {
      setWarehouses(wRes.data.warehouses);
      setStock(sRes.data.stock);
    }).catch((err) => setError(err.response?.data?.message || "Unable to load warehouse data. Please try again.")).finally(() => setLoading(false));
  }, []);

  const totalItems = stock.reduce((sum, s) => sum + s.quantity, 0);
  const lowCount = stock.filter(s => s.product && s.quantity <= s.product.lowStockLimit).length;

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Warehouse overview</h1>
        <p className="page-subtitle">Welcome back, {user?.name}. Here’s your assigned inventory at a glance.</p>
      </div>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <div className="stats-grid">
        <StatCard icon="🏭" label="Assigned Warehouses" value={warehouses.length} color="#10b981" />
        <StatCard icon="📦" label="Total Stock Items" value={totalItems} color="#3b82f6" />
        <StatCard icon="⚠️" label="Low Stock Products" value={lowCount} color="#ef4444" />
      </div>

      <div className="card dashboard-section">
        <h2 className="card-title">My Warehouses</h2>
        <div className="warehouse-cards">
          {warehouses.length === 0 ? <div className="empty">No warehouses are assigned to your account.</div> : warehouses.map(w => (
            <div key={w._id} className="warehouse-card">
              <div className="warehouse-icon">🏭</div>
              <div>
                <div className="warehouse-name">{w.name}</div>
                <div className="warehouse-location">📍 {w.location}</div>
                <div className="warehouse-capacity">Capacity: {w.capacity?.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card dashboard-section">
        <h2 className="card-title">Inventory actions</h2>
        <div className="quick-actions">
          <Link to="/manager/inventory" className="quick-action">
            <span className="quick-action-icon">▥</span>
            <span><span className="quick-action-title">View inventory</span><span className="quick-action-description">Check stock across your locations</span></span>
          </Link>
          <Link to="/manager/stock-in" className="quick-action">
            <span className="quick-action-icon">+</span>
            <span><span className="quick-action-title">Receive stock</span><span className="quick-action-description">Record an incoming delivery</span></span>
          </Link>
          <Link to="/manager/stock-out" className="quick-action">
            <span className="quick-action-icon">−</span>
            <span><span className="quick-action-title">Remove stock</span><span className="quick-action-description">Record an outgoing movement</span></span>
          </Link>
          <Link to="/manager/low-stock" className="quick-action">
            <span className="quick-action-icon">!</span>
            <span><span className="quick-action-title">Low stock</span><span className="quick-action-description">Review products to replenish</span></span>
          </Link>
        </div>
      </div>
    </div>
  );
}
