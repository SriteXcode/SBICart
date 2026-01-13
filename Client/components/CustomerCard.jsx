export default function CustomerCard({
  c,
  view,
  onClick,
  onEdit,
  onDelete,
  onReport,
  onToggleVisit
}) {
  return (
    <div
      onClick={onClick}
      style={{
        border: c.todaysVisit ? "2px solid #ffd700" : "1px solid #444", // Highlight if today's visit
        padding: "12px",
        borderRadius: "8px",
        background: "#1e1e1e",
        cursor: "pointer",
        position: "relative"
      }}
    >
      {/* Today's Visit Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisit(c);
        }}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "transparent",
          border: "none",
          fontSize: "1.5rem",
          cursor: "pointer",
          filter: c.todaysVisit ? "grayscale(0%)" : "grayscale(100%) brightness(0.5)"
        }}
        title="Mark for Today's Visit"
      >
        🚩
      </button>

      <h4 style={{ marginRight: "30px" }}>{c.name}</h4>
      <p>📞 {c.mobile}</p>
      <p>💰 ₹{c.balance}</p>
      {c.pincode && <p>📍 {c.pincode}</p>}

      {view === "grid" && (
        <>
          <p>Account: {c.accountNo}</p>
          <p>Status: {c.status}</p>
          <p>Due: ₹{c.dueAmount}</p>
        </>
      )}

      <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(c);
          }}
        >
          ✏️ Edit
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onReport(c); // ✅ THIS WAS MISSING
          }}
        >
          📄 CD Report
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(c._id);
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
