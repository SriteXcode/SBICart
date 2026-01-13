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
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={{ borderBottom: "1px solid #444", paddingBottom: "10px", marginBottom: "20px" }}>
          Edit Reminder
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={labelStyle}>Customer Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={labelStyle}>Account Number</label>
            <input
              value={accountNo}
              onChange={(e) => setAccountNo(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={labelStyle}>Phone Number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={labelStyle}>Promise Date</label>
            <input
              type="date"
              value={ptpDate}
              onChange={(e) => setPtpDate(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Status</label>
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
              style={{ ...buttonStyle, background: "#444" }}
            >
              Cancel
            </button>
            <button 
              disabled={loading} 
              style={{ ...buttonStyle, background: "#646cff", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(5px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "40px",
    zIndex: 9999,
};

const modalStyle = {
    background: "#1a1a1a",
    color: "#fff",
    padding: "25px",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "400px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    border: "1px solid #333",
};

const labelStyle = {
    display: "block",
    marginBottom: "5px",
    color: "#ccc",
    fontSize: "0.9rem"
};

const inputStyle = {
    width: "100%", 
    padding: "12px", 
    borderRadius: "8px", 
    border: "1px solid #333", 
    background: "#2a2a2a", 
    color: "#fff",
    outline: "none",
    boxSizing: "border-box"
};

const buttonStyle = {
    flex: 1, 
    border: "none", 
    padding: "12px", 
    borderRadius: "8px", 
    cursor: "pointer", 
    color: "#fff",
    fontWeight: "bold",
    fontSize: "1rem"
};
