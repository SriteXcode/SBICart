import { useEffect, useState } from "react";
import { api } from "../api";

export default function CustomerDetailsModal({ c, onClose }) {
  const [ptp, setPtp] = useState(null);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);

    // Fetch PTP for this customer
    const fetchPTP = async () => {
      try {
        const res = await api.get("/ptps");
        // Client-side filtering for simplicity, ideally backend should support query by customerId
        const found = res.data.find(p => p.customer === c._id && p.status === "Pending");
        setPtp(found);
      } catch (err) {
        console.error("Failed to fetch PTP info", err);
      }
    };
    fetchPTP();

    return () => window.removeEventListener("keydown", esc);
  }, [onClose, c._id]);

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h3>{c.name}</h3>

        <p><b>Account:</b> {c.accountNo}</p>
        <p><b>Mobile:</b> {c.mobile}</p>
        <p><b>Balance:</b> ₹{c.balance}</p>
        <p><b>CD:</b> {c.cd}</p>
        <p><b>Cycle Date:</b> {c.cycleDate?.slice(0,10)}</p>
        <p><b>Status:</b> {c.status}</p>
        <p><b>Review:</b> {c.review}</p>
        <p><b>Due Amount:</b> ₹{c.dueAmount}</p>
        <p><b>Ex Day Amount:</b> ₹{c.exDayAmount}</p>
        <p><b>Address:</b> {c.address}</p>
        <p><b>Notes:</b> {c.notes}</p>

        {ptp && (
            <div style={{ marginTop: "15px", padding: "10px", background: "#333", borderRadius: "8px", border: "1px solid #646cff" }}>
                <h4 style={{ margin: "0 0 5px 0", color: "#646cff" }}>⚠️ PTP Active</h4>
                <p style={{ margin: "0" }}>Promise Date: {new Date(ptp.ptpDate).toDateString()}</p>
            </div>
        )}

        <button onClick={onClose} style={{ marginTop: "10px" }}>
          Close
        </button>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2000,
};

const modal = {
  background: "#1e1e1e",
  color: "#fff",
  padding: "20px",
  borderRadius: "10px",
  width: "95%",
  maxWidth: "500px",
  maxHeight: "90vh",
  overflowY: "auto",
};
