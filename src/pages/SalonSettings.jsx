import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

function SalonSettings({ salon }) {
  const navigate = useNavigate();

  // Salon data
  const [salonDetails, setSalonDetails] = useState({
    name: "Jade Boutique",
    type: "Hair Salon & Spa",
    address: "123 Main Street, New York, NY 10001",
    phone: "(555) 123-4567",
    email: "contact@jadeboutique.com",
  });

  // Which field is being edited
  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  // Load salon data from endpoint
  useEffect(() => {
    if (salon?.id) {
      loadSalonDetails();
    }
  }, [salon?.id]);

  const loadSalonDetails = async () => {
    try {
      // TODO: replace with real endpoint
      // const res = await fetch(`${import.meta.env.VITE_API_URL}/api/salons/${salon.id}/details`);
      // const data = await res.json();
      // setSalonDetails(data);

      const mock = {
        name: "Jade Boutique",
        type: "Hair Salon & Spa",
        address: "123 Main Street, New York, NY 10001",
        phone: "(555) 123-4567",
        email: "contact@jadeboutique.com",
      };
      setSalonDetails(mock);
    } catch (err) {
      console.error("Unable to load salon details:", err);
    }
  };

  // Start editing
  const handleEdit = (field) => {
    setEditingField(field);
    setEditingValue(salonDetails[field]);
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

  // Save to backend
  const handleSaveChanges = async () => {
    try {
      // TODO: replace with actual API call
      // await fetch(`${import.meta.env.VITE_API_URL}/api/salons/${salon.id}/details`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(salonDetails),
      // });
      console.log("Saved changes:", salonDetails);
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

        {/* Salon Type */}
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

        {/* Email */}
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
            <p className="settings-value-text">{salonDetails.email}</p>
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
