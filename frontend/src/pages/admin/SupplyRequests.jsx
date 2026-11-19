import { useEffect, useState } from "react";
import api from "../../api/axios";
import StatusBadge from "../../components/StatusBadge";
import { showErrorAlert } from "../../utils/alerts";

export default function SupplyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    setLoading(true);
    api.get("/supply-requests").then(r => setRequests(r.data.requests)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/supply-requests/${id}/status`, { status });
      fetchRequests();
    } catch (err) {
      showErrorAlert("Unable to update request", err.response?.data?.message || "Please try again.");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Supply Requests</h1>
      </div>
      <div className="card">
        {loading ? <div className="spinner-center"><div className="spinner"></div></div> : (
          <table className="table">
            <thead>
              <tr><th>Supplier</th><th>Product</th><th>Warehouse</th><th>Quantity</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r._id}>
                  <td>{r.supplier?.name}</td>
                  <td>{r.product?.name}</td>
                  <td>{r.warehouse?.name}</td>
                  <td>{r.quantity}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>
                    {r.status === "Pending" && (
                      <>
                        <button className="btn btn-sm btn-success" onClick={() => updateStatus(r._id, "Approved")}>Approve</button>
                        <button className="btn btn-sm btn-danger ml-1" onClick={() => updateStatus(r._id, "Rejected")}>Reject</button>
                      </>
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
