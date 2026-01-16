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
        className="visit-toggle"
        style={{
          position: "absolute",
          top: "5%",
          right: "5%",
          background: "transparent",
          border: "2px solid #ffd700",
          fontSize: "1.4rem",
          cursor: "pointer",
          opacity: c.todaysVisit ? 1 : 0.2,
          transition: "opacity 0.2s, transform 0.2s",
          zIndex: 10,
          width: "50px",
          height: "50px",
          borderRadius: "50%",
        }}
        title={c.todaysVisit ? "Remove from Today's Visit" : "Mark for Today's Visit"}
        onMouseOver={(e) => {
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.transform = "scale(1.2)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.opacity = c.todaysVisit ? "1" : "0.2";
          e.currentTarget.style.transform = "scale(1)";
        }}
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
