import { useEffect } from "react";

export default function CustomerDetailsModal({ c, onClose }) {
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

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
