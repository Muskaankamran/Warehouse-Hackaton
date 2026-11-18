import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "4rem" }}>🚫</div>
        <h1 className="auth-title">Access Denied</h1>
        <p className="auth-subtitle">You don't have permission to view this page.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>Go Home</Link>
      </div>
    </div>
  );
}
