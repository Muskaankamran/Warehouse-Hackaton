import { useEffect, useState } from "react";
import api from "../../api/axios";
import Modal from "../../components/Modal";
import StatusBadge from "../../components/StatusBadge";
import { confirmAction, showErrorAlert, showSuccessAlert } from "../../utils/alerts";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "salesRepresentative", assignedWarehouses: [] });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    api.get(`/users${roleFilter ? `?role=${roleFilter}` : ""}`)
      .then((res) => setUsers(res.data.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);
  useEffect(() => {
    api.get("/warehouses").then((res) => setWarehouses(res.data.warehouses)).catch(console.error);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", email: "", password: "", phone: "", role: "salesRepresentative", assignedWarehouses: [] });
    setError(""); setSuccess("");
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({ name: user.name, email: user.email, password: "", phone: user.phone || "", role: user.role, assignedWarehouses: user.assignedWarehouses?.map(w => w._id || w) || [] });
    setError(""); setSuccess("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      if (editing) {
        const data = { ...form };
        if (!data.password) delete data.password;
        await api.put(`/users/${editing._id}`, data);
        setSuccess("User updated!");
      } else {
        await api.post("/users", form);
        setSuccess("User created!");
      }
      fetchUsers();
      setTimeout(() => setShowModal(false), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Error");
    }
  };

  const handleDelete = async (id) => {
    if (!await confirmAction("Delete user?", "This user account will be permanently removed.", "Delete user")) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
      showSuccessAlert("User deleted", "The user account has been removed.");
    } catch (err) {
      showErrorAlert("Unable to delete user", err.response?.data?.message || "Please try again.");
    }
  };

  const toggleWarehouse = (id) => {
    setForm(f => ({
      ...f,
      assignedWarehouses: f.assignedWarehouses.includes(id)
        ? f.assignedWarehouses.filter(w => w !== id)
        : [...f.assignedWarehouses, id]
    }));
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Manage Users</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add User</button>
      </div>

      <div className="filters">
        <select className="form-input filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="warehouseManager">Warehouse Manager</option>
          <option value="supplier">Supplier</option>
          <option value="salesRepresentative">Sales Representative</option>
        </select>
      </div>

      <div className="card">
        {loading ? <div className="spinner-center"><div className="spinner"></div></div> : (
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="user-cell">
                      {u.image && <img src={u.image} className="table-avatar" alt="" />}
                      {u.name}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.phone || "—"}</td>
                  <td><StatusBadge status={u.role} /></td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => openEdit(u)}>Edit</button>
                    <button className="btn btn-sm btn-danger ml-1" onClick={() => handleDelete(u._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? "Edit User" : "Create User"} onClose={() => setShowModal(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label>Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select className="form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="salesRepresentative">Sales Representative</option>
                <option value="warehouseManager">Warehouse Manager</option>
                <option value="supplier">Supplier</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Password {editing && "(leave blank to keep)"}</label>
              <input type="password" className="form-input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} {...(!editing && { required: true })} />
            </div>
            {form.role === "warehouseManager" && (
              <div className="form-group">
                <label>Assign Warehouses</label>
                <div className="checkbox-list">
                  {warehouses.map(w => (
                    <label key={w._id} className="checkbox-item">
                      <input type="checkbox" checked={form.assignedWarehouses.includes(w._id)}
                        onChange={() => toggleWarehouse(w._id)} />
                      {w.name} — {w.location}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-full">{editing ? "Update User" : "Create User"}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
