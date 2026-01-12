import { useEffect, useState } from "react";
import { api } from "../api";

import CustomerCard from "../components/CustomerCard";
import CustomerDetailsModal from "../components/CustomerDetailsModal";
import EditCustomer from "../components/EditCustomer";
import AddCustomer from "../components/AddCustomer";
import CDReportModal from "../components/CDReportModal";
import Stats from "../components/Stats";

import toast from "react-hot-toast";
import { toggleTheme } from "../src/theme";
import { syncOffline } from "../src/offline";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const [view, setView] = useState("list"); // list | grid

  const [selected, setSelected] = useState(null); // details view
  const [edit, setEdit] = useState(null); // edit popup
  const [showAdd, setShowAdd] = useState(false); // add popup
  const [reportCustomer, setReportCustomer] = useState(null); // CD report popup

  const fetchData = async () => {
    const res = await api.get(`/customers?search=${search}&sort=${sort}`);
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
    window.addEventListener("online", () => syncOffline(api));
  }, [search, sort]);

  const handleDelete = async (id) => {
    await api.delete(`/customers/${id}`);
    toast.success("Customer archived");
    fetchData();
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

      {/* STATS */}
      <Stats />

      {/* ADD CUSTOMER */}
      <button
        onClick={() => setShowAdd(true)}
        style={{
          width: "100%",
          padding: "14px",
          background: "#646cff",
          color: "#fff",
          borderRadius: "8px",
          border: "none",
          marginBottom: "10px",
        }}
      >
        + Add New Customer
      </button>

      {/* SEARCH */}
      <input
        placeholder="Search by name / account / mobile"
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      {/* VIEW TOGGLE */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
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
          />
        ))}
      </div>

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
