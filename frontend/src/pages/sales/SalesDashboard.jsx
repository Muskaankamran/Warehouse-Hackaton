import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";

export default function SalesDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/orders")
      .then((r) => setOrders(r.data.orders))
      .catch((err) => setError(err.response?.data?.message || "Unable to load your orders. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders.filter(o => o.status === "Completed").reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const pending = orders.filter(o => o.status === "Pending").length;

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Sales overview</h1>
        <p className="page-subtitle">Welcome, {user?.name}. Keep customer orders moving.</p>
      </div>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <div className="stats-grid">
        <StatCard icon="🛒" label="My Orders" value={orders.length} color="#3b82f6" />
        <StatCard icon="⏳" label="Pending Orders" value={pending} color="#f59e0b" />
        <StatCard icon="💰" label="Total Revenue" value={`Rs. ${totalRevenue.toLocaleString()}`} color="#10b981" />
      </div>

      <div className="card dashboard-section">
        <h2 className="card-title">Recent Orders</h2>
        {orders.length === 0 ? <div className="empty">No orders yet. Create your first order!</div> : (
          <table className="table">
            <thead>
              <tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map(o => (
                <tr key={o._id}>
                  <td><strong>{o.orderNumber}</strong></td>
                  <td>{o.customerName}</td>
                  <td>Rs. {o.totalAmount?.toLocaleString()}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card dashboard-section">
        <h2 className="card-title">Get started</h2>
        <div className="quick-actions">
          <Link to="/sales/create-order" className="quick-action">
            <span className="quick-action-icon">+</span>
            <span><span className="quick-action-title">Create an order</span><span className="quick-action-description">Start a new customer order</span></span>
          </Link>
          <Link to="/sales/products" className="quick-action">
            <span className="quick-action-icon">▦</span>
            <span><span className="quick-action-title">Browse products</span><span className="quick-action-description">Search the available catalog</span></span>
          </Link>
          <Link to="/sales/orders" className="quick-action">
            <span className="quick-action-icon">▣</span>
            <span><span className="quick-action-title">View all orders</span><span className="quick-action-description">Follow your order history</span></span>
          </Link>
        </div>
      </div>
    </div>
  );
}
