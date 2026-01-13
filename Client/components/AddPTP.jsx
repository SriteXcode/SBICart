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
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Add PTP Reminder</h3>
        
        <div style={{ marginBottom: "15px" }}>
          <label style={{ marginRight: "10px" }}>
            <input 
              type="radio" 
              name="ptpType" 
              value="existing" 
              checked={type === "existing"} 
              onChange={() => setType("existing")}
            /> Existing Customer
          </label>
          <label>
            <input 
              type="radio" 
              name="ptpType" 
              value="manual" 
              checked={type === "manual"} 
              onChange={() => setType("manual")}
            /> Manual New User
          </label>
        </div>

        <form onSubmit={handleSubmit}>
          {type === "existing" ? (
            <div style={{ marginBottom: "10px" }}>
              <label>Select Customer</label>
              <select 
                value={selectedCustomerId} 
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                required
                style={{ width: "100%", padding: "8px" }}
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
              <div style={{ marginBottom: "10px" }}>
                <label>Name</label>
                <input
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  required
                  style={{ width: "100%", padding: "8px" }}
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label>Account No.</label>
                <input
                  value={manualAccountNo}
                  onChange={(e) => setManualAccountNo(e.target.value)}
                  required
                  style={{ width: "100%", padding: "8px" }}
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label>Phone No.</label>
                <input
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  required
                  style={{ width: "100%", padding: "8px" }}
                />
              </div>
            </>
          )}

          <div style={{ marginBottom: "10px" }}>
            <label>PTP Date</label>
            <input
              type="date"
              value={ptpDate}
              onChange={(e) => setPtpDate(e.target.value)}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button type="button" onClick={onCancel} style={{ flex: 1, background: "#888" }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ flex: 1 }}>
              {loading ? "Saving..." : "Save PTP"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
