import { useEffect, useState } from "react";
import api from "../../api/axios";
import Modal from "../../components/Modal";
import { confirmAction, showErrorAlert, showSuccessAlert } from "../../utils/alerts";

export default function ManageWarehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", location: "", manager: "", capacity: 1000 });
  const [error, setError] = useState("");

  const fetchWarehouses = () => {
    setLoading(true);
    api.get("/warehouses").then(r => setWarehouses(r.data.warehouses)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchWarehouses(); }, []);
  useEffect(() => {
    api.get("/users?role=warehouseManager").then(r => setManagers(r.data.users)).catch(console.error);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", location: "", manager: "", capacity: 1000 });
    setError("");
    setShowModal(true);
  };

  const openEdit = (w) => {
    setEditing(w);
    setForm({ name: w.name, location: w.location, manager: w.manager?._id || "", capacity: w.capacity });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        await api.put(`/warehouses/${editing._id}`, form);
        showSuccessAlert("Warehouse updated", "Your changes have been saved.");
      } else {
        await api.post("/warehouses", form);
        showSuccessAlert("Warehouse created", "The new warehouse is ready.");
      }
      fetchWarehouses();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error");
    }
  };

  const handleDelete = async (id) => {
    if (!await confirmAction("Delete warehouse?", "This warehouse will be permanently removed.", "Delete warehouse")) return;
    try {
      await api.delete(`/warehouses/${id}`);
      fetchWarehouses();
      showSuccessAlert("Warehouse deleted", "The warehouse has been removed.");
    } catch (err) {
      showErrorAlert("Unable to delete warehouse", err.response?.data?.message || "Please try again.");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Manage Warehouses</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Warehouse</button>
      </div>

      <div className="card">
        {loading ? <div className="spinner-center"><div className="spinner"></div></div> : (
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Location</th><th>Manager</th><th>Capacity</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {warehouses.map(w => (
                <tr key={w._id}>
                  <td><strong>🏭 {w.name}</strong></td>
                  <td>📍 {w.location}</td>
                  <td>{w.manager ? w.manager.name : <span className="text-muted">Unassigned</span>}</td>
                  <td>{w.capacity?.toLocaleString()}</td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => openEdit(w)}>Edit</button>
                    <button className="btn btn-sm btn-danger ml-1" onClick={() => handleDelete(w._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? "Edit Warehouse" : "Add Warehouse"} onClose={() => setShowModal(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label>Warehouse Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Manager</label>
              <select className="form-input" value={form.manager} onChange={e => setForm({ ...form, manager: e.target.value })}>
                <option value="">None</option>
                {managers.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Capacity</label>
              <input type="number" className="form-input" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} min="1" />
            </div>
            <button type="submit" className="btn btn-primary btn-full">{editing ? "Update" : "Create"}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
