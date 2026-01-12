import { useEffect, useState } from "react";
import { api } from "../api";

export default function Stats() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    api.get("/customers/stats").then(res => setStats(res.data));
  }, []);

  return (
    <div className="stats">
      <div>👥 {stats.totalCustomers}</div>
      <div>💰 ₹{stats.totalBalance}</div>
    </div>
  );
}
