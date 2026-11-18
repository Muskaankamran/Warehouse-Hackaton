import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinks = {
  admin: [
    { to: "/admin", icon: "⌂", label: "Dashboard" },
    { to: "/admin/users", icon: "♙", label: "Users" },
    { to: "/admin/products", icon: "▦", label: "Products" },
    { to: "/admin/warehouses", icon: "▤", label: "Warehouses" },
    { to: "/admin/stock", icon: "▥", label: "Inventory" },
    { to: "/admin/transactions", icon: "↗", label: "Transactions" },
    { to: "/admin/orders", icon: "▣", label: "Orders" },
    { to: "/admin/supply-requests", icon: "⇄", label: "Supply requests" },
    { to: "/admin/low-stock", icon: "!", label: "Low stock" },
  ],
  warehouseManager: [
    { to: "/manager", icon: "⌂", label: "Dashboard" },
    { to: "/manager/inventory", icon: "▥", label: "Inventory" },
    { to: "/manager/stock-in", icon: "+", label: "Add stock" },
    { to: "/manager/stock-out", icon: "−", label: "Remove stock" },
    { to: "/manager/transactions", icon: "↗", label: "Transactions" },
    { to: "/manager/low-stock", icon: "!", label: "Low stock" },
  ],
  supplier: [
    { to: "/supplier", icon: "⌂", label: "Dashboard" },
    { to: "/supplier/profile", icon: "♙", label: "My profile" },
    { to: "/supplier/products", icon: "▦", label: "My products" },
    { to: "/supplier/request", icon: "+", label: "Submit request" },
    { to: "/supplier/requests", icon: "▤", label: "My requests" },
  ],
  salesRepresentative: [
    { to: "/sales", icon: "⌂", label: "Dashboard" },
    { to: "/sales/products", icon: "▦", label: "Products" },
    { to: "/sales/create-order", icon: "+", label: "Create order" },
    { to: "/sales/orders", icon: "▣", label: "My orders" },
  ],
};

export default function Sidebar({ isOpen = false, onNavigate = () => {} }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const links = navLinks[user.role] || [];
  const roleLabels = {
    admin: "Administrator",
    warehouseManager: "Warehouse Manager",
    supplier: "Supplier",
    salesRepresentative: "Sales Rep",
  };

  const handleLogout = async () => {
    await logout();
    onNavigate();
    navigate("/login");
  };

  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-logo-mark">W</div>
          <div>
            <div className="sidebar-logo">Stockwise</div>
            <div className="sidebar-tagline">INVENTORY OPERATIONS</div>
          </div>
        </div>
        <div className="sidebar-user">
          {user.image ? (
            <img src={user.image} alt="" className="sidebar-avatar" />
          ) : (
            <div className="sidebar-avatar-fallback" aria-hidden="true">
              {user.name?.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U"}
            </div>
          )}
          <div className="sidebar-user-copy">
            <div className="sidebar-username">{user.name}</div>
            <div className="sidebar-role">{roleLabels[user.role] || "Team member"}</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Workspace</div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            onClick={onNavigate}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <span className="sidebar-link-icon" aria-hidden="true">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button type="button" onClick={handleLogout} className="btn-logout">
          <span className="sidebar-link-icon" aria-hidden="true">↪</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
