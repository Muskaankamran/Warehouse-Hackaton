import { useEffect, useState } from "react";
import api from "../../api/axios";
import StatusBadge from "../../components/StatusBadge";

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/supply-requests").then(r => setRequests(r.data.requests)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Supply Requests</h1>
      </div>
      <div className="card">
        {loading ? <div className="spinner-center"><div className="spinner"></div></div> : requests.length === 0 ? (
          <div className="empty">No requests submitted yet.</div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Date</th><th>Product</th><th>Warehouse</th><th>Quantity</th><th>Status</th><th>Reviewed By</th></tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r._id}>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>{r.product?.name}</td>
                  <td>{r.warehouse?.name}</td>
                  <td>{r.quantity}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>{r.reviewedBy?.name || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
