import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function CDReportModal({ c, onClose }) {
  const [form, setForm] = useState({
    cd: c.cd || "",
    cycle: c.cycleDate || "",
    accountNo: c.accountNo || "",
    chName: c.name || "",
    statementAmount: c.balance || "",
    paidAmount: "",
    feedbackUpdated: "YES",
    feedback: "",
  });

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const reportText = `📌 CD REPORT

CD - ${form.cd}
Cycle - ${form.cycle}
A/C Number - ${form.accountNo}
CH Name - ${form.chName}
Statement Amount - ₹${form.statementAmount}
Paid Amount - ₹${form.paidAmount}
Mobility App Feedback Update - ${form.feedbackUpdated}

Feedback:
${form.feedback}
`;

  const copyReport = async () => {
    await navigator.clipboard.writeText(reportText);
    toast.success("CD report copied for WhatsApp");
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h3>CD Report</h3>

        {[
          ["cd", "CD"],
          ["cycle", "Cycle"],
          ["accountNo", "A/C Number"],
          ["chName", "CH Name"],
          ["statementAmount", "Statement Amount"],
          ["paidAmount", "Paid Amount"],
        ].map(([name, label]) => (
          <input
            key={name}
            name={name}
            placeholder={label}
            value={form[name]}
            onChange={handleChange}
          />
        ))}

        <select
          name="feedbackUpdated"
          value={form.feedbackUpdated}
          onChange={handleChange}
        >
          <option value="YES">YES</option>
          <option value="NO">NO</option>
        </select>

        <textarea
          name="feedback"
          placeholder="Proper feedback"
          value={form.feedback}
          onChange={handleChange}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={copyReport}>📋 Copy</button>
          <button onClick={onClose}>Close</button>
        </div>
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
  zIndex: 4000,
};

const modal = {
  background: "#1e1e1e",
  color: "#fff",
  padding: "20px",
  borderRadius: "10px",
  width: "95%",
  maxWidth: "420px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};
