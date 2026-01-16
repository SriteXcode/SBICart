import { useEffect, useState } from "react";
import { api } from "../api";

import CustomerCard from "../components/CustomerCard";
import CustomerDetailsModal from "../components/CustomerDetailsModal";
import EditCustomer from "../components/EditCustomer";
import AddCustomer from "../components/AddCustomer";
import CDReportModal from "../components/CDReportModal";
import PTPTab from "../components/PTPTab";

import toast from "react-hot-toast";
import { syncOffline } from "../src/offline";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("customers"); // customers | ptp

  const [data, setData] = useState([]);
  const [ptpCount, setPtpCount] = useState(0);
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
  const [reportCustomer, setReportCustomer] = useState(null); // CD report popup
  const [showFilter, setShowFilter] = useState(false); // filter panel toggle

  const navigate = useNavigate();

  const fetchPincodes = async () => {
    try {
      const res = await api.get("/customers/pincodes");
      setAvailablePincodes(res.data);
    } catch (err) {
      console.error("Error fetching pincodes", err);
    }
  };

  const fetchPtpCount = async () => {
    try {
      const res = await api.get("/ptps");
      setPtpCount(res.data.length);
    } catch (err) {
      console.error("Error fetching PTP count", err);
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
    fetchPtpCount();
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
      {/* STICKY CONTAINER FOR HEADER AND TABS */}
      <div style={{ 
        position: "sticky", 
        top: 0, 
        background: "#242424", // Match body background
        zIndex: 1000, 
        margin: "-10px -10px 20px -10px", 
        padding: "10px 10px 0 10px",
        borderBottom: "1px solid #333"
      }}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", gap: "10px" }}>
          <h2 style={{ margin: 0, fontSize: "1.4rem", whiteSpace: "nowrap" }}>Dashboard</h2>
          
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: 1, justifyContent: "flex-end" }}>
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ 
                maxWidth: "200px",
                width: "100%",
                padding: "8px 12px", 
                borderRadius: "20px", 
                border: "1px solid #333", 
                background: "#1a1a1a", 
                color: "#fff",
                fontSize: "0.9rem"
              }}
            />

            <div 
              onClick={() => navigate("/profile")}
              style={{ 
                width: "38px", 
                height: "38px", 
                minWidth: "38px",
                borderRadius: "50%", 
                background: "#646cff", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                cursor: "pointer",
                fontSize: "1.2rem",
                color: "#fff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                transition: "transform 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "scale(1.0)"}
            >
              👤
            </div>
          </div>
        </div>

        {/* TABS (also sticky inside this container) */}
        <div style={{ display: "flex", gap: "10px", paddingBottom: "10px" }}>
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
                    Customers ({data.length})
                  </button>          <button 
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
            PTP Reminders ({ptpCount})
          </button>
        </div>
      </div>

      {/* STATS (Global or per tab? Keeping global for now, but maybe it should only be for customers) */}
      {/* Moving Stats inside Customers tab because it likely relates to customer balances */}
      
      {activeTab === "customers" ? (
        <>
          {/* STICKY CONTROL ROW */}
          <div style={{
            position: "sticky",
            top: "135px", // Adjust based on header + tabs height
            zIndex: 900,
            background: "#242424",
            padding: "10px 0",
            margin: "0 -10px", // Expand to full width to cover scrolling content
            paddingLeft: "10px",
            paddingRight: "10px",
            borderBottom: "1px solid #333"
          }}>
            {/* ADD CUSTOMER (60%), FILTER (20%), VIEW (20%) */}
            <div style={{ display: "flex", gap: "1%", alignItems: "center" }}>
              <button
                onClick={() => setShowAdd(true)}
                style={{
                  width: "58%",
                  height: "42px",
                  background: "#646cff",
                  color: "#fff",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxSizing: "border-box"
                }}
              >
                + Add Customer
              </button>
              
              <button
                onClick={() => setShowFilter(!showFilter)}
                style={{
                  width: "20%",
                  height: "42px",
                  borderRadius: "8px",
                  border: "1px solid #333",
                  background: showFilter ? "#646cff" : "#1a1a1a",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  boxSizing: "border-box"
                }}
                title="Filters & Sort"
              >
                🌪️
              </button>

              <select
                value={view}
                onChange={(e) => setView(e.target.value)}
                style={{ 
                  width: "20%", 
                  height: "42px",
                  padding: "0 10px", 
                  borderRadius: "8px", 
                  border: "1px solid #333", 
                  background: "#1a1a1a", 
                  color: "#fff",
                  cursor: "pointer",
                  boxSizing: "border-box"
                }}
              >
                <option value="list">📄</option>
                <option value="grid">🟦</option>
              </select>
            </div>
          </div>

          {/* FILTER MODAL */}
          {showFilter && (
            <div 
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.7)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 2000
              }}
              onClick={() => setShowFilter(false)}
            >
              <div 
                style={{ 
                  background: "#1e1e1e", 
                  padding: "20px", 
                  borderRadius: "12px", 
                  width: "90%",
                  maxWidth: "400px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "15px" 
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #333", paddingBottom: "10px" }}>
                  <h3 style={{ margin: 0 }}>🌪️ Filters & Sort</h3>
                  <button 
                    onClick={() => setShowFilter(false)}
                    style={{ background: "transparent", border: "none", color: "#888", fontSize: "1.2rem", cursor: "pointer" }}
                  >
                    ✕
                  </button>
                </div>

                {/* Sort */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "0.9rem", color: "#aaa" }}>Sort Order</label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid #444", background: "#252525", color: "#fff", cursor: "pointer" }}
                  >
                    <option value="newest">Newest First</option>
                    <option value="alpha">Alphabetical (A–Z)</option>
                    <option value="balance">Highest Balance</option>
                  </select>
                </div>

                {/* Pincode */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "0.9rem", color: "#aaa" }}>Pincode Area</label>
                  <select
                    value={pincodeFilter}
                    onChange={(e) => setPincodeFilter(e.target.value)}
                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid #444", background: "#252525", color: "#fff", cursor: "pointer" }}
                  >
                    <option value="">All Pincodes</option>
                    {availablePincodes.map(pin => (
                      <option key={pin} value={pin}>{pin}</option>
                    ))}
                  </select>
                </div>
                
                {/* Today's Visit */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "0.9rem", color: "#aaa" }}>Daily Tasks</label>
                  <button
                    onClick={() => setTodaysVisitFilter(!todaysVisitFilter)}
                    style={{
                      background: todaysVisitFilter ? "#ffd700" : "#333",
                      color: todaysVisitFilter ? "#000" : "#fff",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {todaysVisitFilter 
                      ? `⭐ Showing Today's Visits (${data.length})` 
                      : "⭐ Show Today's Visits Only"}
                  </button>
                </div>

                <button 
                  onClick={() => setShowFilter(false)}
                  style={{ 
                    marginTop: "10px", 
                    padding: "12px", 
                    background: "#646cff", 
                    color: "#fff", 
                    border: "none", 
                    borderRadius: "8px", 
                    fontWeight: "bold", 
                    cursor: "pointer" 
                  }}
                >
                  Apply & Close
                </button>
              </div>
            </div>
          )}

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
        </>
      ) : (
        <PTPTab onSelectCustomer={setSelected} />
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

      {/* CD REPORT POPUP */}
      {reportCustomer && (
        <CDReportModal
          c={reportCustomer}
          onClose={() => setReportCustomer(null)}
        />
      )}
    </div>
  );
}
