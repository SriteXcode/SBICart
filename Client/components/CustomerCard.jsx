export default function CustomerCard({
  c,
  view,
  onClick,
  onEdit,
  onDelete,
  onReport,
}) {
  return (
    <div
      onClick={onClick}
      style={{
        border: "1px solid #444",
        padding: "12px",
        borderRadius: "8px",
        background: "#1e1e1e",
        cursor: "pointer",
      }}
    >
      <h4>{c.name}</h4>
      <p>📞 {c.mobile}</p>
      <p>💰 ₹{c.balance}</p>

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
