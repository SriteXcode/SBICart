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

      // Strict mapping config: Header Name in Excel (normalized) -> Object Key in DB
      const mapping = {
        "name": "name",
        "account no": "accountNo",
        "mobile no": "mobile",
        "current balance": "balance",
        "cd": "cd",
        "review": "review",
        "due amount": "dueAmount",
        "ex day amount": "exDayAmount",
        "address": "address",
        "pincode": "pincode",
        "cycle date": "cycleDate"
      };

      // Create a map of Index -> DB Key based on lowercase header match
      const columnMap = {};
      
      fileHeaders.forEach((h, index) => {
        if (!h) return;
        const cleanHeader = String(h).trim().toLowerCase();
        if (mapping[cleanHeader]) {
          columnMap[index] = mapping[cleanHeader];
        }
      });

      // Verification: Warn if critical columns are missing? 
      // User asked for "strict header", implies we should expect these.
      // But let's be flexible enough to allow upload even if optional fields like 'review' are missing,
      // unless 'Name' is missing.
      
      const mappedData = rows.map(row => {
        const obj = {};
        
        Object.keys(columnMap).forEach(index => {
          const key = columnMap[index];
          let val = row[index];

          // Data cleaning/formatting
          if (val === undefined || val === null) {
              val = ""; // Normalize empty to empty string or appropriate default
          }

          if (key === "cycleDate") {
             // Handle Excel Date (number) or String
             if (typeof val === 'number') {
                // Excel dates are days since 1900-01-01 (approx)
                // JS dates are ms since 1970
                // Simple conversion: new Date(Math.round((val - 25569)*86400*1000))
                const date = new Date(Math.round((val - 25569)*86400*1000));
                obj[key] = date;
             } else if (val) {
                obj[key] = new Date(val); // Try parsing string
             }
          } else {
             obj[key] = val;
          }
        });
        
        // Auto-extract pincode if not found in columns but present in address
        if (obj.address && (!obj.pincode || obj.pincode === "")) {
          const match = String(obj.address).match(/\b\d{6}\b/);
          if (match) {
            obj.pincode = match[0];
            // Optional: Remove pincode from address? Keeping it simple for now.
          }
        }

        // Defaults
        if (!obj.status) obj.status = "Active";

        return obj;
      });

      // Filter rows that don't have a name (empty rows)
      const validRows = mappedData.filter(d => d.name && String(d.name).trim() !== "");

      if (validRows.length === 0) {
        toast.error("No valid data found. Check column headers.");
        return;
      }

      setHeaders(fileHeaders);
      setData(validRows);
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
            <p style={{fontSize: '0.8rem', color: '#aaa'}}>
              Expected columns: Name, Account No, mobile no, current Balance, CD, Review, due amount, ex day amount, Address, Pincode, cycle date
            </p>
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
                    <th style={thStyle}>CD</th>
                    <th style={thStyle}>Due Amt</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((c, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #333" }}>
                      <td style={tdStyle}>{c.name}</td>
                      <td style={tdStyle}>{c.mobile}</td>
                      <td style={tdStyle}>{c.accountNo}</td>
                      <td style={tdStyle}>{c.balance}</td>
                      <td style={tdStyle}>{c.cd}</td>
                      <td style={tdStyle}>{c.dueAmount}</td>
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
