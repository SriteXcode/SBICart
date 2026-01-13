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
      <div className="modal-content" style={{ maxWidth: "400px" }}>
        <h3 style={{ borderBottom: "1px solid #444", paddingBottom: "10px", marginBottom: "20px" }}>
          Edit Reminder
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", color: "#ccc" }}>Customer Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", color: "#ccc" }}>Account Number</label>
            <input
              value={accountNo}
              onChange={(e) => setAccountNo(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", color: "#ccc" }}>Phone Number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", color: "#ccc" }}>Promise Date</label>
            <input
              type="date"
              value={ptpDate}
              onChange={(e) => setPtpDate(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", color: "#ccc" }}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={inputStyle}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Broken">Broken</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              type="button" 
              onClick={onCancel} 
              style={{ flex: 1, background: "#444", color: "#fff", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button 
              disabled={loading} 
              style={{ flex: 1, background: "#646cff", color: "#fff", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", 
  padding: "10px", 
  borderRadius: "6px", 
  border: "1px solid #444", 
  background: "#222", 
  color: "#fff",
  outline: "none"
};
