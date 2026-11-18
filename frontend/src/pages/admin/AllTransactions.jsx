import { useEffect, useState } from "react";
import api from "../../api/axios";
import StatusBadge from "../../components/StatusBadge";

export default function AllTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = typeFilter ? `?type=${typeFilter}` : "";
    api.get(`/transactions${params}`).then(r => setTransactions(r.data.transactions)).catch(console.error).finally(() => setLoading(false));
  }, [typeFilter]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Stock Transactions</h1>
      </div>
      <div className="filters">
        <select className="form-input filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="stock-in">Stock In</option>
          <option value="stock-out">Stock Out</option>
        </select>
      </div>
      <div className="card">
        {loading ? <div className="spinner-center"><div className="spinner"></div></div> : (
          <table className="table">
            <thead>
              <tr><th>Date</th><th>Product</th><th>Warehouse</th><th>Type</th><th>Quantity</th><th>Performed By</th><th>Note</th></tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t._id}>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td>{t.product?.name}</td>
                  <td>{t.warehouse?.name}</td>
                  <td><StatusBadge status={t.transactionType} /></td>
                  <td>{t.quantity}</td>
                  <td>{t.performedBy?.name}</td>
                  <td>{t.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
