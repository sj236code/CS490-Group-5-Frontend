import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

function SalonSettings() {
  const navigate = useNavigate();
  const location = useLocation();

  const { salonId } = location.state || {};

  // const salonId = 1;

  // Salon data
  const [salonDetails, setSalonDetails] = useState({
    name: "",
    type: "",
    address: "",
    city: "",
    phone: "",
    email: "",  // not from this endpoint yet, placeholder
    about: "",
  });

  // Which field is being edited
  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  // Load salon data from endpoint
  useEffect(() => {
    if (salonId) {
      loadSalonDetails();
    }
  }, [salonId]);

  const loadSalonDetails = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/salons/details/${salonId}`
      );
      const data = await res.json();
      console.log("SalonDetails: ", data);

      if (!res.ok) {
        console.error("Unable to load salon details:", data);
        return;
      }

      // Map backend fields to the shape we use in this component
      setSalonDetails({
        name: data.name || "",
        // types is an array from the endpoint -> join as a simple string
        type: Array.isArray(data.types) ? data.types.join(", ") : "",
        address: data.address || "",
        city: data.city || "",
        phone: data.phone || "",
        email: "", // your GET endpoint doesn't return email yet
        about: data.about || "",
      });
    } catch (err) {
      console.error("Unable to load salon details:", err);
    }
  };

  // Start editing
  const handleEdit = (field) => {
    setEditingField(field);
    setEditingValue(salonDetails[field] || "");
  };

  // Confirm edit
  const handleConfirm = () => {
    if (!editingField) return;
    setSalonDetails((prev) => ({
      ...prev,
      [editingField]: editingValue,
    }));
    setEditingField(null);
    setEditingValue("");
  };

  // Cancel edit
  const handleCancel = () => {
    setEditingField(null);
    setEditingValue("");
  };

  // Save to backend (when you have PUT endpoint)
  const handleSaveChanges = async () => {
    try {
      console.log("Saved changes (placeholder):", salonDetails);
      // Later:
      // await fetch(`${import.meta.env.VITE_API_URL}/api/salons/${salon.id}/details`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(salonDetails),
      // });
    } catch (err) {
      console.error("Error saving salon details:", err);
    }
  };

  return (
    <div className="salon-settings-page">
      <div className="salon-settings-card">
        <h1 className="salon-settings-title">Settings</h1>

        {/* Salon Name */}
        <div className="settings-field-block">
          <div className="settings-label-row">
            <span className="settings-label">Salon Name</span>
            <button
              className="settings-edit-btn"
              onClick={() => handleEdit("name")}
            >
              <Pencil size={14} />
            </button>
          </div>
          {editingField === "name" ? (
            <div className="settings-edit-area">
              <input
                className="settings-input"
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
              />
              <div className="settings-inline-buttons">
                <button className="settings-confirm-btn" onClick={handleConfirm}>
                  Confirm
                </button>
                <button className="settings-cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="settings-value-text">{salonDetails.name}</p>
          )}
        </div>

        {/* Salon Type (from types[] in endpoint) */}
        <div className="settings-field-block">
          <div className="settings-label-row">
            <span className="settings-label">Salon Type</span>
            <button
              className="settings-edit-btn"
              onClick={() => handleEdit("type")}
            >
              <Pencil size={14} />
            </button>
          </div>
          {editingField === "type" ? (
            <div className="settings-edit-area">
              <input
                className="settings-input"
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
              />
              <div className="settings-inline-buttons">
                <button className="settings-confirm-btn" onClick={handleConfirm}>
                  Confirm
                </button>
                <button className="settings-cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="settings-value-text">{salonDetails.type}</p>
          )}
        </div>

        {/* Address */}
        <div className="settings-field-block">
          <div className="settings-label-row">
            <span className="settings-label">Address</span>
            <button
              className="settings-edit-btn"
              onClick={() => handleEdit("address")}
            >
              <Pencil size={14} />
            </button>
          </div>
          {editingField === "address" ? (
            <div className="settings-edit-area">
              <input
                className="settings-input"
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
              />
              <div className="settings-inline-buttons">
                <button className="settings-confirm-btn" onClick={handleConfirm}>
                  Confirm
                </button>
                <button className="settings-cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="settings-value-text">{salonDetails.address}</p>
          )}
        </div>

        {/* City */}
        <div className="settings-field-block">
          <div className="settings-label-row">
            <span className="settings-label">City</span>
            <button
              className="settings-edit-btn"
              onClick={() => handleEdit("city")}
            >
              <Pencil size={14} />
            </button>
          </div>
          {editingField === "city" ? (
            <div className="settings-edit-area">
              <input
                className="settings-input"
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
              />
              <div className="settings-inline-buttons">
                <button className="settings-confirm-btn" onClick={handleConfirm}>
                  Confirm
                </button>
                <button className="settings-cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="settings-value-text">{salonDetails.city}</p>
          )}
        </div>

        {/* Phone */}
        <div className="settings-field-block">
          <div className="settings-label-row">
            <span className="settings-label">Phone</span>
            <button
              className="settings-edit-btn"
              onClick={() => handleEdit("phone")}
            >
              <Pencil size={14} />
            </button>
          </div>
          {editingField === "phone" ? (
            <div className="settings-edit-area">
              <input
                className="settings-input"
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
              />
              <div className="settings-inline-buttons">
                <button className="settings-confirm-btn" onClick={handleConfirm}>
                  Confirm
                </button>
                <button className="settings-cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="settings-value-text">{salonDetails.phone}</p>
          )}
        </div>

        {/* Email (placeholder for now) */}
        <div className="settings-field-block">
          <div className="settings-label-row">
            <span className="settings-label">Email</span>
            <button
              className="settings-edit-btn"
              onClick={() => handleEdit("email")}
            >
              <Pencil size={14} />
            </button>
          </div>
          {editingField === "email" ? (
            <div className="settings-edit-area">
              <input
                className="settings-input"
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
              />
              <div className="settings-inline-buttons">
                <button className="settings-confirm-btn" onClick={handleConfirm}>
                  Confirm
                </button>
                <button className="settings-cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="settings-value-text">
              {salonDetails.email || "Not set"}
            </p>
          )}
        </div>

        {/* About */}
        <div className="settings-field-block">
          <div className="settings-label-row">
            <span className="settings-label">About</span>
            <button
              className="settings-edit-btn"
              onClick={() => handleEdit("about")}
            >
              <Pencil size={14} />
            </button>
          </div>
          {editingField === "about" ? (
            <div className="settings-edit-area">
              <textarea
                className="settings-input settings-textarea"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                rows={4}
              />
              <div className="settings-inline-buttons">
                <button className="settings-confirm-btn" onClick={handleConfirm}>
                  Confirm
                </button>
                <button className="settings-cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="settings-value-text">
              {salonDetails.about || "No about section set yet."}
            </p>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="salon-settings-footer">
          <button className="settings-back-btn" onClick={() => navigate(-1)}>
            Back
          </button>
          <button className="settings-save-btn" onClick={handleSaveChanges}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default SalonSettings;
