import { useEffect, useState } from "react";
import api from "../../api/axios";
import StatusBadge from "../../components/StatusBadge";

export default function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = () => {
    setLoading(true);
    const params = statusFilter ? `?status=${statusFilter}` : "";
    api.get(`/orders${params}`).then(r => setOrders(r.data.orders)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating status");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>All Orders</h1>
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

      <div className="card">
        {loading ? <div className="spinner-center"><div className="spinner"></div></div> : (
          <table className="table">
            <thead>
              <tr><th>Order #</th><th>Customer</th><th>Warehouse</th><th>Total</th><th>Status</th><th>Created By</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id}>
                  <td><strong>{o.orderNumber}</strong></td>
                  <td>{o.customerName}</td>
                  <td>{o.warehouse?.name}</td>
                  <td>Rs. {o.totalAmount?.toLocaleString()}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>{o.createdBy?.name}</td>
                  <td>
                    {o.status === "Pending" && (
                      <button className="btn btn-sm btn-primary" onClick={() => updateStatus(o._id, "Processing")}>Process</button>
                    )}
                    {o.status === "Processing" && (
                      <button className="btn btn-sm btn-success" onClick={() => updateStatus(o._id, "Completed")}>Complete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
