import { useState, useEffect } from "react";
import { api } from "../api";

export default function AddPTP({ onAdd, onCancel }) {
  const [type, setType] = useState("existing"); // existing | manual
  const [customers, setCustomers] = useState([]);
  
  // Form fields
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualAccountNo, setManualAccountNo] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [ptpDate, setPtpDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (type === "existing") {
      fetchCustomers();
    }
  }, [type]);

  const fetchCustomers = async () => {
    try {
      // Fetching all customers for the dropdown (might need optimization for large lists)
      const res = await api.get("/customers?sort=alpha");
      setCustomers(res.data);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/ptps", {
        type,
        customerId: selectedCustomerId,
        name: manualName,
        accountNo: manualAccountNo,
        phone: manualPhone,
        ptpDate,
      });
      onAdd();
    } catch (err) {
      alert("Failed to add PTP");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={{ borderBottom: "1px solid #444", paddingBottom: "10px", marginBottom: "20px" }}>
            Add PTP Reminder
        </h3>
        
        <div style={{ marginBottom: "20px", display: "flex", gap: "15px" }}>
          <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
            <input 
              type="radio" 
              name="ptpType" 
              value="existing" 
              checked={type === "existing"} 
              onChange={() => setType("existing")}
            /> Existing
          </label>
          <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
            <input 
              type="radio" 
              name="ptpType" 
              value="manual" 
              checked={type === "manual"} 
              onChange={() => setType("manual")}
            /> Manual New
          </label>
        </div>

        <form onSubmit={handleSubmit}>
          {type === "existing" ? (
            <div style={{ marginBottom: "15px" }}>
              <label style={labelStyle}>Select Customer</label>
              <select 
                value={selectedCustomerId} 
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                required
                style={inputStyle}
              >
                <option value="">-- Select --</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.accountNo})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "15px" }}>
                <label style={labelStyle}>Name</label>
                <input
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label style={labelStyle}>Account No.</label>
                <input
                  value={manualAccountNo}
                  onChange={(e) => setManualAccountNo(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label style={labelStyle}>Phone No.</label>
                <input
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
            </>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>PTP Date</label>
            <input
              type="date"
              value={ptpDate}
              onChange={(e) => setPtpDate(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button type="button" onClick={onCancel} style={{ ...buttonStyle, background: "#444" }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ ...buttonStyle, background: "#646cff", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Saving..." : "Save PTP"}
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
    alignItems: "flex-start", // Top positioning
    paddingTop: "40px",
    zIndex: 9999, // High z-index
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
