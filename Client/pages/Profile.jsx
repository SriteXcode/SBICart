import { useEffect, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { toggleTheme } from "../src/theme";
import BulkUploadModal from "../components/BulkUploadModal";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching data", err);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleNotifications = async () => {
    if (user.pushSubscription) {
      // Unsubscribe logic
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
        await api.post("/auth/unsubscribe");
        setUser({ ...user, pushSubscription: null });
        toast.success("Notifications disabled");
      } catch (err) {
        console.error("Unsubscribe error", err);
        toast.error("Failed to disable notifications");
      }
      return;
    }

    // Subscribe logic
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
      return;
    }
    
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      try {
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

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_PUBLIC_VAPID_KEY)
        });

        // Send subscription to backend
        await api.post("/auth/subscribe", subscription);

        setUser({ ...user, pushSubscription: subscription });
        
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

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
        <p>User not found.</p>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            background: "#646cff",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div style={{ 
          width: "60px", 
          height: "60px", 
          borderRadius: "50%", 
          background: "#646cff", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          fontSize: "2rem",
          color: "#fff",
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
        }}>
          👤
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "8px 12px",
              width: "fit-content",
              height: "fit-content",
              background: "#333",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.9rem"
            }}
          >
            Back
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            style={{
              padding: "8px 12px",
              width: "fit-content",
              height: "fit-content",
              background: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.9rem"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ 
        background: "#1a1a1a", 
        padding: "30px", 
        borderRadius: "12px", 
        boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
        marginBottom: "20px"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ color: "#888", fontSize: "0.9rem" }}>Full Name</label>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{user.name}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ color: "#888", fontSize: "0.9rem" }}>Email Address</label>
            <div style={{ fontSize: "1.1rem" }}>{user.email || "N/A"}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ color: "#888", fontSize: "0.9rem" }}>Phone Number</label>
            <div style={{ fontSize: "1.1rem" }}>{user.phone || "N/A"}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ color: "#888", fontSize: "0.9rem" }}>Joined On</label>
            <div style={{ fontSize: "1rem", color: "#ccc" }}>
              {new Date(user.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button 
          onClick={toggleTheme}
          style={{
            padding: "8px 15px",
            width: "fit-content",
            background: "#333",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          🌗 Theme
        </button>

        <button 
          onClick={toggleNotifications}
          style={{
            padding: "8px 15px",
            width: "fit-content",
            background: user.pushSubscription ? "#28a745" : "#333",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          {user.pushSubscription ? "🔔 Enabled" : "🔕 Disabled"}
        </button>

        <button 
          onClick={() => setShowBulkUpload(true)}
          style={{
            padding: "8px 15px",
            width: "fit-content",
            background: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          📤 Upload Excel
        </button>
      </div>

      {showBulkUpload && (
        <BulkUploadModal
          onClose={() => setShowBulkUpload(false)}
          onSuccess={() => {
            setShowBulkUpload(false);
            toast.success("Upload successful. Check dashboard.");
          }}
        />
      )}
    </div>
  );
}
