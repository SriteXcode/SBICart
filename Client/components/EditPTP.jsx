import { useState, useEffect } from "react";
import { api } from "../api";

export default function EditPTP({ ptp, onCancel, refresh }) {
  const [name, setName] = useState(ptp.name);
  const [accountNo, setAccountNo] = useState(ptp.accountNo);
  const [phone, setPhone] = useState(ptp.phone || "");
  const [ptpDate, setPtpDate] = useState("");
  const [status, setStatus] = useState(ptp.status);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Format date for input type="date"
    if (ptp.ptpDate) {
      const d = new Date(ptp.ptpDate);
      setPtpDate(d.toISOString().split("T")[0]);
    }
  }, [ptp]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/ptps/${ptp._id}`, {
        name,
        accountNo,
        phone,
        ptpDate,
        status,
      });
      refresh();
      onCancel();
    } catch (err) {
      alert("Failed to update PTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Edit PTP</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "10px" }}>
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Account No.</label>
            <input
              value={accountNo}
              onChange={(e) => setAccountNo(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Date</label>
            <input
              type="date"
              value={ptpDate}
              onChange={(e) => setPtpDate(e.target.value)}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Broken">Broken</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button type="button" onClick={onCancel} style={{ flex: 1, background: "#888" }}>
              Cancel
            </button>
            <button disabled={loading} style={{ flex: 1 }}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
