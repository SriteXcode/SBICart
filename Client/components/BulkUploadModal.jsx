import { useState } from "react";
import * as XLSX from "xlsx";
import { api } from "../api";
import toast from "react-hot-toast";

export default function BulkUploadModal({ onClose, onSuccess }) {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Select File, 2: Preview

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 }); // Array of arrays

      if (jsonData.length === 0) {
        toast.error("Empty file");
        return;
      }

      const fileHeaders = jsonData[0];
      const rows = jsonData.slice(1);

      // Simple mapping strategy
      // We need to map file headers to: name, accountNo, mobile, balance, address, pincode
      
      const mappedData = rows.map(row => {
        const obj = {};
        fileHeaders.forEach((h, i) => {
          const val = row[i];
          const header = h.toLowerCase().trim();
          
          if (header.includes("name")) obj.name = val;
          else if (header.includes("account") || header.includes("ac")) obj.accountNo = val;
          else if (header.includes("mobile") || header.includes("phone")) obj.mobile = val;
          else if (header.includes("balance") || header.includes("amount")) obj.balance = val;
          else if (header.includes("address")) obj.address = val;
          else if (header.includes("pincode") || header.includes("pin")) obj.pincode = val;
          else if (header.includes("cd")) obj.cd = val;
          else if (header.includes("review")) obj.review = val;
          else if (header.includes("note")) obj.notes = val;
        });
        
        // Defaults
        if (!obj.status) obj.status = "Active";
        if (!obj.name) obj.name = "Unknown"; // specific handling?

        return obj;
      });

      setHeaders(fileHeaders);
      setData(mappedData.filter(d => d.name && d.name !== "Unknown")); // Filter empty rows
      setStep(2);
    };
    reader.readAsBinaryString(file);
  };

  const handleUpload = async () => {
    setLoading(true);
    try {
      await api.post("/customers/bulk", data);
      toast.success(`Successfully uploaded ${data.length} customers!`);
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload customers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h3>Upload Customers (Excel)</h3>

        {step === 1 && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p>Select an .xlsx or .xls file.</p>
            <p style={{fontSize: '0.8rem', color: '#aaa'}}>Expected columns: Name, Account, Mobile, Balance, Address, Pincode</p>
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={handleFileUpload}
              style={{ marginTop: "20px" }}
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <p>{data.length} customers found.</p>
            <div style={{ 
              maxHeight: "300px", 
              overflow: "auto", 
              marginBottom: "20px",
              border: "1px solid #444",
              borderRadius: "4px"
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                <thead>
                  <tr style={{ textAlign: "left", background: "#333" }}>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Mobile</th>
                    <th style={thStyle}>Account</th>
                    <th style={thStyle}>Balance</th>
                    <th style={thStyle}>Pincode</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((c, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #333" }}>
                      <td style={tdStyle}>{c.name}</td>
                      <td style={tdStyle}>{c.mobile}</td>
                      <td style={tdStyle}>{c.accountNo}</td>
                      <td style={tdStyle}>{c.balance}</td>
                      <td style={tdStyle}>{c.pincode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button 
                onClick={() => setStep(1)}
                style={{ background: "transparent", border: "1px solid #666", color: "#fff", padding: "8px 16px", borderRadius: "4px" }}
              >
                Back
              </button>
              <button 
                onClick={handleUpload}
                disabled={loading}
                style={{ background: "#646cff", border: "none", color: "#fff", padding: "8px 16px", borderRadius: "4px" }}
              >
                {loading ? "Uploading..." : "Confirm Upload"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle = { padding: "8px" };
const tdStyle = { padding: "8px" };

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1100,
};

const modalStyle = {
  background: "#1e1e1e",
  color: "#fff",
  padding: "20px",
  borderRadius: "10px",
  width: "90%",
  maxWidth: "700px",
};
