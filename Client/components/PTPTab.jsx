import { useState, useEffect } from "react";
import { api } from "../api";
import AddPTP from "./AddPTP";
import toast from "react-hot-toast";

export default function PTPTab() {
  const [ptps, setPtps] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("All"); // All | Pending | Paid | Broken

  const fetchPTPs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/ptps");
      setPtps(res.data);
    } catch (err) {
      console.error("Failed to fetch PTPs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPTPs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this PTP?")) return;
    try {
      await api.delete(`/ptps/${id}`);
      toast.success("PTP deleted");
      fetchPTPs();
    } catch (err) {
      toast.error("Failed to delete PTP");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/ptps/${id}`, { status });
      toast.success(`PTP marked as ${status}`);
      fetchPTPs();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
      return;
    }
    
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_PUBLIC_VAPID_KEY)
        });

        // Send subscription to backend
        await api.post("/auth/subscribe", subscription);

        new Notification("Notifications Enabled", {
            body: "You will now receive daily PTP reminders.",
            icon: "/vite.svg"
        });
        toast.success("Push notifications enabled!");
      } catch (err) {
        console.error("Push subscription error", err);
        toast.error("Failed to subscribe to push notifications");
      }
    } else {
      toast.error("Notification permission denied");
    }
  };

  const filteredPTPs = ptps.filter(p => {
    if (filterStatus !== "All" && p.status !== filterStatus) return false;
    if (filterDate) {
        const pDate = new Date(p.ptpDate).toISOString().split("T")[0];
        if (pDate !== filterDate) return false;
    }
    return true;
  });

  return (
    <div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
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
          + Add PTP Reminder
        </button>
        <button
          onClick={requestNotificationPermission}
          style={{
            padding: "14px",
            background: "#333",
            color: "#fff",
            borderRadius: "8px",
            border: "none",
          }}
        >
          🔔 Enable Notifications
        </button>
      </div>

      {/* FILTERS */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
        <input 
            type="date" 
            value={filterDate} 
            onChange={(e) => setFilterDate(e.target.value)}
            style={{ padding: "8px", borderRadius: "6px", border: "1px solid #333", background: "#222", color: "#fff" }}
        />
        <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: "8px", borderRadius: "6px", border: "1px solid #333", background: "#222", color: "#fff" }}
        >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Broken">Broken</option>
        </select>
        {(filterDate || filterStatus !== "All") && (
            <button 
                onClick={() => { setFilterDate(""); setFilterStatus("All"); }}
                style={{ padding: "8px 12px", background: "#444", border: "none", color: "#fff", borderRadius: "6px" }}
            >
                Clear Filters
            </button>
        )}
      </div>

      {loading ? (
        <p>Loading PTPs...</p>
      ) : (
        <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {filteredPTPs.map((ptp) => (
            <div
              key={ptp._id}
              style={{
                background: "#1a1a1a",
                padding: "15px",
                borderRadius: "8px",
                border: "1px solid #333",
                position: "relative"
              }}
            >
              <button 
                onClick={() => handleDelete(ptp._id)}
                style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "transparent",
                    border: "none",
                    color: "#888",
                    cursor: "pointer",
                    fontSize: "1.2rem"
                }}
              >
                &times;
              </button>
              <h3 style={{ margin: "0 0 5px 0" }}>{ptp.name}</h3>
              <p style={{ margin: "5px 0", color: "#ccc" }}>Account: {ptp.accountNo || "N/A"}</p>
              <p style={{ margin: "5px 0", color: "#646cff", fontWeight: "bold" }}>
                Date: {new Date(ptp.ptpDate).toDateString()}
              </p>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                <span style={{ 
                    padding: "2px 8px", 
                    borderRadius: "4px", 
                    fontSize: "0.8rem",
                    background: ptp.status === "Paid" ? "green" : ptp.status === "Broken" ? "red" : "#444",
                }}>
                    {ptp.status}
                </span>

                {ptp.status === "Pending" && (
                    <button 
                        onClick={() => handleStatusChange(ptp._id, "Paid")}
                        style={{
                            background: "#28a745",
                            color: "#fff",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.8rem"
                        }}
                    >
                        ✓ Mark Paid
                    </button>
                )}
              </div>
            </div>
          ))}
          {filteredPTPs.length === 0 && <p style={{ color: "#888" }}>No PTPs found.</p>}
        </div>
      )}

      {showAdd && (
        <AddPTP
          onAdd={() => {
            setShowAdd(false);
            fetchPTPs();
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
