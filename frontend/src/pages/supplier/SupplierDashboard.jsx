import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/StatCard";

export default function SupplierDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get(`/products?supplier=${user._id}`),
      api.get("/supply-requests"),
    ]).then(([pRes, rRes]) => {
      setProducts(pRes.data.products);
      setRequests(rRes.data.requests);
    }).catch((err) => setError(err.response?.data?.message || "Unable to load supplier data. Please try again.")).finally(() => setLoading(false));
  }, [user._id]);

  const pending = requests.filter(r => r.status === "Pending").length;
  const approved = requests.filter(r => r.status === "Approved").length;

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Supplier overview</h1>
        <p className="page-subtitle">Welcome, {user?.name}. Manage your products and supply requests.</p>
      </div>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <div className="stats-grid">
        <StatCard icon="📦" label="My Products" value={products.length} color="#f59e0b" />
        <StatCard icon="📋" label="Total Requests" value={requests.length} color="#6366f1" />
        <StatCard icon="⏳" label="Pending Requests" value={pending} color="#3b82f6" />
        <StatCard icon="✅" label="Approved Requests" value={approved} color="#10b981" />
      </div>

      <div className="card dashboard-section">
        <h2 className="card-title">My Products</h2>
        <div className="product-grid">
          {products.length === 0 ? <div className="empty">No products associated</div> : products.map(p => (
            <div key={p._id} className="product-card">
              {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="product-img" /> : <div className="product-img-placeholder">📦</div>}
              <div className="product-info">
                <div className="product-name">{p.name}</div>
                <div className="product-sku">SKU: {p.sku}</div>
                <div className="product-category">{p.category}</div>
                <div className="product-price">Rs. {p.price?.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card dashboard-section">
        <h2 className="card-title">Supplier actions</h2>
        <div className="quick-actions">
          <Link to="/supplier/request" className="quick-action">
            <span className="quick-action-icon">+</span>
            <span><span className="quick-action-title">Submit a supply request</span><span className="quick-action-description">Request stock for a warehouse</span></span>
          </Link>
          <Link to="/supplier/requests" className="quick-action">
            <span className="quick-action-icon">▤</span>
            <span><span className="quick-action-title">Track your requests</span><span className="quick-action-description">Review current request statuses</span></span>
          </Link>
          <Link to="/supplier/profile" className="quick-action">
            <span className="quick-action-icon">♙</span>
            <span><span className="quick-action-title">Update your profile</span><span className="quick-action-description">Keep your supplier details current</span></span>
          </Link>
        </div>
      </div>
    </div>
  );
}
