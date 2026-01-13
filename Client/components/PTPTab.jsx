import { useState, useEffect } from "react";
import { api } from "../api";
import AddPTP from "./AddPTP";
import toast from "react-hot-toast";

export default function PTPTab() {
  const [ptps, setPtps] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
      return;
    }
    
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      new Notification("Notifications Enabled", {
        body: "You will now receive PTP reminders.",
        icon: "/vite.svg"
      });
      toast.success("Notifications enabled!");
    } else {
      toast.error("Notification permission denied");
    }
  };

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

      {loading ? (
        <p>Loading PTPs...</p>
      ) : (
        <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {ptps.map((ptp) => (
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
              <span style={{ 
                display: "inline-block", 
                padding: "2px 8px", 
                borderRadius: "4px", 
                fontSize: "0.8rem",
                background: ptp.status === "Paid" ? "green" : "#444",
                marginTop: "5px"
              }}>
                {ptp.status}
              </span>
            </div>
          ))}
          {ptps.length === 0 && <p style={{ color: "#888" }}>No PTPs found.</p>}
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
