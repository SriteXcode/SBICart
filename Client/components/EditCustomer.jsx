import { useEffect, useState } from "react";
import { api } from "../api";

export default function EditCustomer({ c, onClose, refresh }) {
  if (!c) return null;

  const [form, setForm] = useState({
    name: c.name || "",
    accountNo: c.accountNo || "",
    mobile: c.mobile || "",
    balance: c.balance || "",
    cd: c.cd || "",
    address: c.address || "",
    cycleDate: c.cycleDate ? c.cycleDate.slice(0, 10) : "",
    status: c.status || "Active",
    review: c.review || "",
    dueAmount: c.dueAmount || "",
    exDayAmount: c.exDayAmount || "",
    notes: c.notes || "",
  });

  const [loading, setLoading] = useState(false);

  /* 🔑 ESC key to close */
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/customers/${c._id}`, form);
      refresh();
      onClose();
    } catch (err) {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      {/* ⛔ stop closing when clicking inside modal */}
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h3>Edit Customer</h3>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
          <input name="accountNo" value={form.accountNo} onChange={handleChange} placeholder="Account No" />
          <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="Mobile" />
          <input name="balance" type="number" value={form.balance} onChange={handleChange} placeholder="Balance" />
          <input name="cd" value={form.cd} onChange={handleChange} placeholder="CD" />

          <textarea name="address" value={form.address} onChange={handleChange} placeholder="Address" />

          <input name="cycleDate" type="date" value={form.cycleDate} onChange={handleChange} />

          <select name="status" value={form.status} onChange={handleChange}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
            <option value="Closed">Closed</option>
          </select>

          <input name="review" value={form.review} onChange={handleChange} placeholder="Review" />

          <div style={{ display: "flex", gap: "8px" }}>
            <input
              name="dueAmount"
              type="number"
              value={form.dueAmount}
              onChange={handleChange}
              placeholder="Due Amount"
              style={{ flex: 1 }}
            />
            <input
              name="exDayAmount"
              type="number"
              value={form.exDayAmount}
              onChange={handleChange}
              placeholder="Ex Day Amount"
              style={{ flex: 1 }}
            />
          </div>

          <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" />

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  overflowY: "auto",
};

const modalStyle = {
  background: "#1e1e1e",
  color: "#fff",
  padding: "20px",
  borderRadius: "10px",
  width: "95%",
  maxWidth: "500px",
};
