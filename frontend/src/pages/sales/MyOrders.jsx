import { useEffect, useState } from "react";
import api from "../../api/axios";
import StatusBadge from "../../components/StatusBadge";
import { confirmAction, showErrorAlert, showSuccessAlert } from "../../utils/alerts";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = () => {
    setLoading(true);
    const params = statusFilter ? `?status=${statusFilter}` : "";
    api.get(`/orders${params}`).then(r => setOrders(r.data.orders)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const cancelOrder = async (id) => {
    if (!await confirmAction("Cancel order?", "This pending order will be cancelled.", "Cancel order")) return;
    try {
      await api.put(`/orders/${id}/cancel`);
      fetchOrders();
      showSuccessAlert("Order cancelled", "The order has been cancelled.");
    } catch (err) {
      showErrorAlert("Unable to cancel order", err.response?.data?.message || "Please try again.");
    }
  };

  const [expanded, setExpanded] = useState(null);

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Orders</h1>
      </div>
      <div className="filters">
        <select className="form-input filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      <div className="orders-list">
        {loading ? <div className="spinner-center"><div className="spinner"></div></div> : orders.length === 0 ? (
          <div className="empty">No orders found.</div>
        ) : orders.map(o => (
          <div key={o._id} className="order-card">
            <div className="order-card-header" onClick={() => setExpanded(expanded === o._id ? null : o._id)}>
              <div>
                <strong>{o.orderNumber}</strong>
                <span className="order-customer"> — {o.customerName}</span>
              </div>
              <div className="order-card-right">
                <StatusBadge status={o.status} />
                <strong>Rs. {o.totalAmount?.toLocaleString()}</strong>
                <span className="expand-icon">{expanded === o._id ? "▲" : "▼"}</span>
              </div>
            </div>
            {expanded === o._id && (
              <div className="order-card-body">
                <div className="order-meta">
                  <span>📍 {o.warehouse?.name}</span>
                  <span>📅 {new Date(o.createdAt).toLocaleDateString()}</span>
                  {o.customerPhone && <span>📞 {o.customerPhone}</span>}
                </div>
                <table className="table">
                  <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                  <tbody>
                    {o.products.map((item, i) => (
                      <tr key={i}>
                        <td>{item.product?.name || "—"}</td>
                        <td>{item.quantity}</td>
                        <td>Rs. {item.price?.toLocaleString()}</td>
                        <td>Rs. {(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {o.status === "Pending" && (
                  <button className="btn btn-danger btn-sm mt-2" onClick={() => cancelOrder(o._id)}>Cancel Order</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
