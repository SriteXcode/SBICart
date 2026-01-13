import { useEffect, useState } from "react";
import { api } from "../api";

import CustomerCard from "../components/CustomerCard";
import CustomerDetailsModal from "../components/CustomerDetailsModal";
import EditCustomer from "../components/EditCustomer";
import AddCustomer from "../components/AddCustomer";
import BulkUploadModal from "../components/BulkUploadModal";
import CDReportModal from "../components/CDReportModal";
import Stats from "../components/Stats";
import PTPTab from "../components/PTPTab";

import toast from "react-hot-toast";
import { toggleTheme } from "../src/theme";
import { syncOffline } from "../src/offline";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("customers"); // customers | ptp

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [todaysVisitFilter, setTodaysVisitFilter] = useState(false);
  const [pincodeFilter, setPincodeFilter] = useState("");
  const [availablePincodes, setAvailablePincodes] = useState([]);

  const [view, setView] = useState("list"); // list | grid

  const [selected, setSelected] = useState(null); // details view
  const [edit, setEdit] = useState(null); // edit popup
  const [showAdd, setShowAdd] = useState(false); // add popup
  const [showBulkUpload, setShowBulkUpload] = useState(false); // bulk upload popup
  const [reportCustomer, setReportCustomer] = useState(null); // CD report popup

  const fetchPincodes = async () => {
    try {
      const res = await api.get("/customers/pincodes");
      setAvailablePincodes(res.data);
    } catch (err) {
      console.error("Error fetching pincodes", err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers?search=${search}&sort=${sort}&todaysVisit=${todaysVisitFilter}&pincode=${pincodeFilter}`);
      setData(res.data);
    } catch (err) {
      console.error("Fetch Error", err);
    } finally {
      setLoading(false);
    }
  };

  const checkReminders = async () => {
    try {
      const res = await api.get("/ptps");
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      const due = res.data.filter((p) => {
        const pDate = new Date(p.ptpDate).toISOString().split("T")[0];
        return pDate === today && p.status === "Pending";
      });

      if (due.length > 0) {
        if (Notification.permission === "granted") {
          due.forEach((p) => {
            new Notification(`PTP Reminder: ${p.name}`, {
              body: `Amount Due. Account: ${p.accountNo || "N/A"}`,
              icon: "/vite.svg",
            });
          });
        } else if (Notification.permission !== "denied") {
            // Optional: Ask for permission if not asked yet, 
            // but usually better to let user click the button in PTP tab
        }
      }
    } catch (err) {
      console.error("Error checking reminders", err);
    }
  };

  useEffect(() => {
    if (activeTab === "customers") {
      fetchData();
      fetchPincodes(); // Update pincodes list
    }
    window.addEventListener("online", () => syncOffline(api));
    checkReminders();
  }, [search, sort, activeTab, todaysVisitFilter, pincodeFilter]);

  const handleDelete = async (id) => {
    await api.delete(`/customers/${id}`);
    toast.success("Customer archived");
    fetchData();
  };

  const handleToggleVisit = async (c) => {
    try {
      const updated = { ...c, todaysVisit: !c.todaysVisit };
      // Optimistic update
      setData(prev => prev.map(item => item._id === c._id ? updated : item));
      
      await api.put(`/customers/${c._id}`, { todaysVisit: updated.todaysVisit });
      toast.success(updated.todaysVisit ? "Marked for Today's Visit" : "Removed from Today's Visit");
    } catch (err) {
      console.error("Error toggling visit", err);
      fetchData(); // revert on error
    }
  };

  return (
    <div style={{ padding: "10px", paddingBottom: "80px" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Dashboard</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={toggleTheme}>🌗</button>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid #333", paddingBottom: "10px" }}>
        <button 
          onClick={() => setActiveTab("customers")}
          style={{
            background: activeTab === "customers" ? "#646cff" : "transparent",
            color: activeTab === "customers" ? "#fff" : "#888",
            border: "none",
            fontSize: "1.1rem",
            fontWeight: "bold",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Customers
        </button>
        <button 
          onClick={() => setActiveTab("ptp")}
          style={{
            background: activeTab === "ptp" ? "#646cff" : "transparent",
            color: activeTab === "ptp" ? "#fff" : "#888",
            border: "none",
            fontSize: "1.1rem",
            fontWeight: "bold",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          PTP Reminders
        </button>
      </div>

      {/* STATS (Global or per tab? Keeping global for now, but maybe it should only be for customers) */}
      {/* Moving Stats inside Customers tab because it likely relates to customer balances */}
      
      {activeTab === "customers" ? (
        <>
          <Stats />

          {/* ADD CUSTOMER & UPLOAD */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <button
              onClick={() => setShowAdd(true)}
              style={{
                flex: 1,
                padding: "14px",
                background: "#646cff",
                color: "#fff",
                borderRadius: "8px",
                border: "none",
              }}
            >
              + Add Customer
            </button>
            <button
              onClick={() => setShowBulkUpload(true)}
              style={{
                flex: 1,
                padding: "14px",
                background: "#28a745",
                color: "#fff",
                borderRadius: "8px",
                border: "none",
              }}
            >
              📤 Upload Excel
            </button>
          </div>

          {/* SEARCH */}
          <input
            placeholder="Search by name / account / mobile / address"
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />

          {/* VIEW TOGGLE & FILTER */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={() => setView("list")}
              style={{
                background: view === "list" ? "#646cff" : "#333",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: "6px",
              }}
            >
              📄 List
            </button>
            <button
              onClick={() => setView("grid")}
              style={{
                background: view === "grid" ? "#646cff" : "#333",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: "6px",
              }}
            >
              🟦 Grid
            </button>

            {/* Pincode Filter */}
            <select
              value={pincodeFilter}
              onChange={(e) => setPincodeFilter(e.target.value)}
              style={{
                background: "#333",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: "6px",
                border: "none"
              }}
            >
              <option value="">📍 All Pincodes</option>
              {availablePincodes.map(pin => (
                <option key={pin} value={pin}>{pin}</option>
              ))}
            </select>
            
            <button
              onClick={() => setTodaysVisitFilter(!todaysVisitFilter)}
              style={{
                background: todaysVisitFilter ? "#ffd700" : "#333",
                color: todaysVisitFilter ? "#000" : "#fff",
                padding: "6px 10px",
                borderRadius: "6px",
                marginLeft: "auto"
              }}
            >
              {todaysVisitFilter ? "⭐ Showing Today's Visits" : "⭐ Show Today's Visits"}
            </button>
          </div>

          {/* SORT */}
          <select
            onChange={(e) => setSort(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          >
            <option value="newest">Newest</option>
            <option value="alpha">A–Z</option>
            <option value="balance">Balance</option>
          </select>

          {/* CUSTOMER VIEW */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                <div className="spinner"></div>
                <p>Loading customers...</p>
            </div>
          ) : (
            <div
              style={{
                display: view === "grid" ? "grid" : "flex",
                gridTemplateColumns:
                  view === "grid"
                    ? "repeat(auto-fill, minmax(260px, 1fr))"
                    : "none",
                flexDirection: view === "list" ? "column" : "unset",
                gap: "12px",
              }}
            >
              {data.map((c) => (
                <CustomerCard
                  key={c._id}
                  c={c}
                  view={view}
                  onClick={() => setSelected(c)}
                  onEdit={setEdit}
                  onReport={setReportCustomer}
                  onDelete={handleDelete}
                  onToggleVisit={handleToggleVisit}
                />
              ))}
              {data.length === 0 && <p style={{ textAlign: "center", color: "#888" }}>No customers found.</p>}
            </div>
          )}

          {/* DETAILS POPUP */}
          {selected && (
            <CustomerDetailsModal
              c={selected}
              onClose={() => setSelected(null)}
            />
          )}

          {/* EDIT POPUP */}
          {edit && (
            <EditCustomer
              c={edit}
              onClose={() => setEdit(null)}
              refresh={fetchData}
            />
          )}

          {/* ADD POPUP */}
          {showAdd && (
            <AddCustomer
              onAdd={() => {
                setShowAdd(false);
                fetchData();
              }}
              onCancel={() => setShowAdd(false)}
            />
          )}

          {/* BULK UPLOAD POPUP */}
          {showBulkUpload && (
            <BulkUploadModal
              onClose={() => setShowBulkUpload(false)}
              onSuccess={() => {
                setShowBulkUpload(false);
                fetchData();
              }}
            />
          )}

          {/* CD REPORT POPUP */}
          {reportCustomer && (
            <CDReportModal
              c={reportCustomer}
              onClose={() => setReportCustomer(null)}
            />
          )}
        </>
      ) : (
        <PTPTab />
      )}
    </div>
  );
}
