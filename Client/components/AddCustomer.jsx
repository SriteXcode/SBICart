import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api";
import { saveOffline } from "../src/offline";

export default function AddCustomer({ onAdd, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    accountNo: "",
    mobile: "",
    balance: "",
    cd: "",
    address: "",
    cycleDate: "",
    status: "Active",
    review: "",
    dueAmount: "",
    exDayAmount: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/customers", formData);
      toast.success("Customer added!");
      onAdd(); 
    } catch (err) {
      console.error(err);
      // If offline or error, try saving offline
      // check if it's network error
      saveOffline(formData);
      toast("Saved offline (network issue?)");
      onAdd(); // Close form anyway or let user know? 
               // For now, behave as if added to queue
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
    fontSize: "16px" // Prevent zoom on mobile
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "var(--background-color, #242424)",
      padding: "20px",
      overflowY: "auto",
      zIndex: 1000,
      display: "flex",
      flexDirection: "column"
    }}>
      <h2>Add New Customer</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        
        <input 
          name="name" 
          placeholder="Customer Name" 
          value={formData.name} 
          onChange={handleChange} 
          required 
          style={inputStyle}
        />

        <input 
          name="accountNo" 
          placeholder="Account No" 
          value={formData.accountNo} 
          onChange={handleChange} 
          required 
          style={inputStyle}
        />

        <input 
          name="mobile" 
          placeholder="Mobile No" 
          value={formData.mobile} 
          onChange={handleChange} 
          required 
          type="tel"
          style={inputStyle}
        />

        <input 
          name="balance" 
          placeholder="Current Balance" 
          value={formData.balance} 
          onChange={handleChange} 
          type="number"
          style={inputStyle}
        />

        <input 
          name="cd" 
          placeholder="CD" 
          value={formData.cd} 
          onChange={handleChange} 
          style={inputStyle}
        />

        <input 
          name="review" 
          placeholder="Review" 
          value={formData.review} 
          onChange={handleChange} 
          style={inputStyle}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            name="dueAmount" 
            placeholder="Due Amount" 
            value={formData.dueAmount} 
            onChange={handleChange} 
            type="number"
            style={{ ...inputStyle, flex: 1 }}
          />
          <input 
            name="exDayAmount" 
            placeholder="Ex Day Amount" 
            value={formData.exDayAmount} 
            onChange={handleChange} 
            type="number"
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>

        <textarea 
          name="address" 
          placeholder="Address" 
          value={formData.address} 
          onChange={handleChange} 
          style={{...inputStyle, height: "80px"}}
        />

        <input 
          name="pincode" 
          placeholder="Pincode" 
          value={formData.pincode || ""} 
          onChange={handleChange} 
          style={inputStyle}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.8em' }}>Cycle Date</label>
            <input 
              name="cycleDate" 
              type="date"
              value={formData.cycleDate} 
              onChange={handleChange} 
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
             <label style={{ fontSize: '0.8em' }}>Status</label>
             <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} style={{
          padding: "15px",
          backgroundColor: "#646cff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "18px",
          marginTop: "10px"
        }}>
          {loading ? "Saving..." : "Save Customer"}
        </button>

        <button type="button" onClick={onCancel} style={{
          padding: "15px",
          backgroundColor: "transparent",
          color: "inherit",
          border: "1px solid currentColor",
          borderRadius: "8px",
          fontSize: "16px",
          marginTop: "10px"
        }}>
          Cancel
        </button>

      </form>
    </div>
  );
}
