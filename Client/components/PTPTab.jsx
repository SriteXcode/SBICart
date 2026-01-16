import { useState, useEffect } from "react";
import { api } from "../api";
import AddPTP from "./AddPTP";
import EditPTP from "./EditPTP";
import toast from "react-hot-toast";

export default function PTPTab({ onSelectCustomer }) {
  const [ptps, setPtps] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editPTP, setEditPTP] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("All"); // All | Pending | Paid | Broken

  const fetchPTPs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/ptps");
      setPtps(res.data);
    } catch (err) {
      console.error("Failed to fetch PTPs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPTPs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this PTP?")) return;
    try {
      await api.delete(`/ptps/${id}`);
      toast.success("PTP deleted");
      fetchPTPs();
    } catch (err) {
      toast.error("Failed to delete PTP");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/ptps/${id}`, { status });
      toast.success(`PTP marked as ${status}`);
      fetchPTPs();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const filteredPTPs = ptps.filter(p => {
    if (filterStatus !== "All" && p.status !== filterStatus) return false;
    if (filterDate) {
        const pDate = new Date(p.ptpDate).toISOString().split("T")[0];
        if (pDate !== filterDate) return false;
    }
    return true;
  });

  return (
    <div>
      <div style={{
        position: "sticky",
        top: "135px",
        zIndex: 900,
        background: "#242424",
        padding: "10px 0",
        margin: "0 -10px 10px -10px",
        paddingLeft: "10px",
        paddingRight: "10px",
        borderBottom: "1px solid #333"
      }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              flex: 1,
              padding: "14px",
              background: "#646cff",
              color: "#fff",
              borderRadius: "8px",
              border: "none",
              fontWeight: "bold"
            }}
          >
            + Add PTP Reminder
          </button>
        </div>

        {/* FILTERS & REFRESH */}
        <div style={{ 
          display: "flex", 
          gap: "8px", 
          justifyContent: "space-between", 
          alignItems: "center",
          flexWrap: "wrap"
        }}>
          <div style={{ display: "flex", gap: "8px", flex: 1, maxWidth: "300px" }}>
            <input 
                type="date" 
                value={filterDate} 
                onChange={(e) => setFilterDate(e.target.value)}
                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #333", background: "#222", color: "#fff", flex: 1, minWidth: "120px" }}
            />
            <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #333", background: "#222", color: "#fff", flex: 1, minWidth: "100px" }}
            >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Broken">Broken</option>
            </select>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
                onClick={fetchPTPs}
                style={{
                    background: "#444",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 14px",
                    fontSize: "1.1rem",
                    cursor: "pointer",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
                title="Refresh List"
            >
                ↻
            </button>
          </div>
        </div>
      </div>

      {(filterDate || filterStatus !== "All") && (
          <button 
              onClick={() => { setFilterDate(""); setFilterStatus("All"); }}
              style={{ padding: "8px 12px", background: "#444", border: "none", color: "#fff", borderRadius: "6px", marginBottom: "15px", width: "100%" }}
          >
              Clear Filters
          </button>
      )}

      {loading ? (
        <p>Loading PTPs...</p>
      ) : (
        <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {filteredPTPs.map((ptp) => (
            <div
              key={ptp._id}
              onClick={() => {
                if (ptp.customer && onSelectCustomer) {
                  onSelectCustomer(ptp.customer);
                } else if (!ptp.customer) {
                   toast("No linked customer profile found.", { icon: "ℹ️" });
                }
              }}
              style={{
                background: "#1a1a1a",
                padding: "15px",
                borderRadius: "8px",
                border: "1px solid #333",
                position: "relative",
                cursor: ptp.customer ? "pointer" : "default",
                transition: "background 0.2s"
              }}
              onMouseOver={(e) => { if(ptp.customer) e.currentTarget.style.background = "#222"; }}
              onMouseOut={(e) => { if(ptp.customer) e.currentTarget.style.background = "#1a1a1a"; }}
            >
              <h3 style={{ margin: "0 0 5px 0" }}>{ptp.name}</h3>
              <p style={{ margin: "5px 0", color: "#ccc" }}>Account: {ptp.accountNo || "N/A"}</p>
              <p style={{ margin: "5px 0", color: "#ccc" }}>Phone: {ptp.phone || "N/A"}</p>
              <p style={{ margin: "5px 0", color: "#646cff", fontWeight: "bold" }}>
                Date: {new Date(ptp.ptpDate).toDateString()}
              </p>
              
              <div 
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", flexWrap: "wrap", gap: "10px" }}
                onClick={(e) => e.stopPropagation()} // Prevent opening details when clicking actions
              >
                <span style={{ 
                    padding: "2px 8px", 
                    borderRadius: "4px", 
                    fontSize: "0.8rem",
                    background: ptp.status === "Paid" ? "green" : ptp.status === "Broken" ? "red" : "#444",
                }}>
                    {ptp.status}
                </span>

                <div style={{ display: "flex", gap: "6px" }}>
                    {ptp.phone && (
                        <a 
                            href={`tel:${ptp.phone}`}
                            style={{
                                background: "#007bff",
                                color: "#fff",
                                textDecoration: "none",
                                padding: "6px 10px",
                                borderRadius: "4px",
                                fontSize: "0.8rem",
                                display: "flex",
                                alignItems: "center"
                            }}
                        >
                            📞 Call
                        </a>
                    )}
                    {ptp.status === "Pending" && (
                        <button 
                            onClick={() => handleStatusChange(ptp._id, "Paid")}
                            style={{
                                background: "#28a745",
                                color: "#fff",
                                border: "none",
                                padding: "6px 10px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "0.8rem"
                            }}
                        >
                            Mark Paid
                        </button>
                    )}
                    <button 
                      onClick={() => setEditPTP(ptp)}
                      style={{
                          background: "#444",
                          color: "#fff",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.8rem"
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(ptp._id)}
                      style={{
                          background: "#dc3545",
                          color: "#fff",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.8rem"
                      }}
                    >
                      🗑️
                    </button>
                </div>
              </div>
            </div>
          ))}
          {filteredPTPs.length === 0 && <p style={{ color: "#888" }}>No PTPs found.</p>}
        </div>
      )}

      {showAdd && (
        <AddPTP
          onAdd={() => {
            setShowAdd(false);
            fetchPTPs();
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}
      
      {editPTP && (
        <EditPTP
          ptp={editPTP}
          onCancel={() => setEditPTP(null)}
          refresh={fetchPTPs}
        />
      )}
    </div>
  );
}
