import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import StatCard from "../../components/StatCard";

const roleLabels = {
  admin: "Administrators",
  warehouseManager: "Warehouse managers",
  supplier: "Suppliers",
  salesRepresentative: "Sales representatives",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/dashboard/stats")
      .then((res) => setStats(res.data.stats))
      .catch((err) => setError(err.response?.data?.message || "Unable to load dashboard data. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Overview</h1>
        <p className="page-subtitle">A live view of your inventory operations.</p>
      </div>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <div className="stats-grid">
        <StatCard icon="👥" label="Total Users" value={stats?.totalUsers} color="#6366f1" />
        <StatCard icon="📦" label="Products" value={stats?.totalProducts} color="#3b82f6" />
        <StatCard icon="🏭" label="Warehouses" value={stats?.totalWarehouses} color="#10b981" />
        <StatCard icon="🛒" label="Total Orders" value={stats?.totalOrders} color="#f59e0b" />
        <StatCard icon="⏳" label="Pending Orders" value={stats?.pendingOrders} color="#ef4444" />
        <StatCard icon="⚠️" label="Low Stock Items" value={stats?.lowStockCount} color="#f59e0b" />
        <StatCard icon="🔄" label="Transactions" value={stats?.totalTransactions} color="#8b5cf6" />
        <StatCard icon="🚚" label="Pending Supply Requests" value={stats?.pendingSupplyRequests} color="#06b6d4" />
      </div>

      {stats?.usersByRole && (
        <div className="card dashboard-section">
          <h2 className="card-title">Users by Role</h2>
          <div className="role-grid">
            {stats.usersByRole.map((r) => (
              <div key={r._id} className="role-item">
                <span className="role-name">{roleLabels[r._id] || r._id}</span>
                <span className="role-count">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card dashboard-section">
        <h2 className="card-title">Quick actions</h2>
        <div className="quick-actions">
          <Link to="/admin/products" className="quick-action">
            <span className="quick-action-icon">▦</span>
            <span><span className="quick-action-title">Manage products</span><span className="quick-action-description">Update your product catalog</span></span>
          </Link>
          <Link to="/admin/warehouses" className="quick-action">
            <span className="quick-action-icon">▤</span>
            <span><span className="quick-action-title">Manage warehouses</span><span className="quick-action-description">Review locations and assignments</span></span>
          </Link>
          <Link to="/admin/orders" className="quick-action">
            <span className="quick-action-icon">▣</span>
            <span><span className="quick-action-title">Review orders</span><span className="quick-action-description">Track and process sales orders</span></span>
          </Link>
          <Link to="/admin/low-stock" className="quick-action">
            <span className="quick-action-icon">!</span>
            <span><span className="quick-action-title">Check low stock</span><span className="quick-action-description">See products that need attention</span></span>
          </Link>
        </div>
      </div>
    </div>
  );
}
