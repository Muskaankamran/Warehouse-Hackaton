import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import ImageUpload from "../../components/ImageUpload";

export default function SupplierProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "", image: user?.image || "", imageFileId: user?.imageFileId || "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await api.put(`/users/${user._id}`, form);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Profile</h1>
      </div>
      <div className="card form-card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="profile-avatar-section">
          {form.image ? <img src={form.image} alt="Profile" className="profile-avatar" /> : <div className="profile-avatar-placeholder">👤</div>}
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Name</label>
            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email (read-only)</label>
            <input className="form-input" value={user?.email} disabled />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Profile / Logo Image</label>
            <ImageUpload
              folder="profiles"
              currentImage={form.image}
              onUpload={({ url, fileId }) => setForm({ ...form, image: url, imageFileId: fileId })}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full">Update Profile</button>
        </form>
      </div>
    </div>
  );
}
