import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "salesRepresentative" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register(form);
      const routes = {
        admin: "/admin",
        warehouseManager: "/manager",
        supplier: "/supplier",
        salesRepresentative: "/sales",
      };
      navigate(routes[user.role] || "/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (!err.response
            ? "Couldn't reach the API. Check that the backend is running and the API URL/CORS settings are correct."
            : "Registration failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <aside className="auth-visual">
        <div className="auth-visual-brand">
          <span className="auth-visual-mark">W</span>
          <span>
            <span className="auth-visual-brand-name">Stockwise</span>
            <span className="auth-visual-brand-caption">Inventory operations</span>
          </span>
        </div>
        <div className="auth-visual-content">
          <div className="auth-eyebrow">Built for teams that keep things moving</div>
          <h2 className="auth-visual-title">A better way to run your inventory.</h2>
          <p className="auth-visual-description">
            Bring products, suppliers, warehouses, and orders together in one dependable workspace.
          </p>
          <ul className="auth-feature-list">
            <li><span className="auth-feature-check">✓</span> Keep stock organized across locations</li>
            <li><span className="auth-feature-check">✓</span> Follow requests and orders with ease</li>
            <li><span className="auth-feature-check">✓</span> Give every team the tools they need</li>
          </ul>
        </div>
        <div className="auth-visual-footer">Warehouse operations, thoughtfully connected.</div>
      </aside>
      <main className="auth-form-panel">
        <section className="auth-card">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Set up your profile to get started.</p>

          {error && <div className="alert alert-error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="register-name">Full name</label>
              <input id="register-name" type="text" className="form-input" placeholder="Your name"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" required />
            </div>
            <div className="form-group">
              <label htmlFor="register-email">Email address</label>
              <input id="register-email" type="email" className="form-input" placeholder="you@company.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="register-phone">Phone <span className="text-muted">(optional)</span></label>
                <input id="register-phone" type="tel" className="form-input" placeholder="+92 300 1234567"
                  value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
              </div>
              <div className="form-group">
                <label htmlFor="register-role">Workspace role</label>
                <select id="register-role" className="form-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="salesRepresentative">Sales Representative</option>
                  <option value="supplier">Supplier</option>
                  <option value="warehouseManager">Warehouse Manager</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="register-password">Password</label>
              <div className="password-field">
                <input id="register-password" type={showPassword ? "text" : "password"} className="form-input" placeholder="At least 6 characters"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" required minLength={6} />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="auth-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </section>
      </main>
    </div>
  );
}
