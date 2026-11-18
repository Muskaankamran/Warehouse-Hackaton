export default function StatusBadge({ status }) {
  const colors = {
    Pending: "#f59e0b",
    Processing: "#3b82f6",
    Completed: "#10b981",
    Cancelled: "#ef4444",
    Approved: "#10b981",
    Rejected: "#ef4444",
    "stock-in": "#10b981",
    "stock-out": "#ef4444",
  };

  const color = colors[status] || "#6b7280";

  return (
    <span
      className="status-badge"
      style={{ background: color + "22", color, border: `1px solid ${color}` }}
    >
      {status}
    </span>
  );
}
