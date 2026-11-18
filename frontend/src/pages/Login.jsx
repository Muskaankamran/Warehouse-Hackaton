import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const routes = {
        admin: "/admin",
        warehouseManager: "/manager",
        supplier: "/supplier",
        salesRepresentative: "/sales",
      };
      navigate(routes[user.role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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
          <div className="auth-eyebrow">A clearer view of your operations</div>
          <h2 className="auth-visual-title">Everything in stock. Everything in sync.</h2>
          <p className="auth-visual-description">
            Manage your warehouses, follow every stock movement, and keep orders moving from one workspace.
          </p>
          <ul className="auth-feature-list">
            <li><span className="auth-feature-check">✓</span> Real-time inventory visibility</li>
            <li><span className="auth-feature-check">✓</span> One workspace for every team</li>
            <li><span className="auth-feature-check">✓</span> Clear, accountable stock movement</li>
          </ul>
        </div>
        <div className="auth-visual-footer">Warehouse operations, thoughtfully connected.</div>
      </aside>
      <main className="auth-form-panel">
        <section className="auth-card">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue to your workspace.</p>

          {error && <div className="alert alert-error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="password-field">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                  required
                />
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
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="auth-link">
            Don't have an account? <Link to="/register">Create an account</Link>
          </p>
        </section>
      </main>
    </div>
  );
}
