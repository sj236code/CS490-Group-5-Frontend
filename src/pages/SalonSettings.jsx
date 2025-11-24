// src/components/salon_dashboard/SalonSettings.jsx
import { useEffect, useState } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

function SalonSettings({ salon }) {
  const navigate = useNavigate();
  const location = useLocation();

  const salonIdFromState = location.state && location.state.salonId;
  const salonIdFromProp = salon?.id;
  const salonId = salonIdFromState || salonIdFromProp;

  console.log("Salon ID: ", salonId);

  const [salonDetails, setSalonDetails] = useState({
    name: "",
    types: "",
    address: "",
    city: "",
    phone: "",
    about: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  useEffect(() => {
    if (!salonId) return;
    loadSalonDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId]);

  const loadSalonDetails = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      setSaveMessage("");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/salons/details/${salonId}`
      );

      if (!res.ok) {
        throw new Error(`Failed to load salon details (${res.status})`);
      }

      const data = await res.json();
      console.log("SalonSettings details:", data);

      setSalonDetails({
        name: data.name || "",
        types: data.types && Array.isArray(data.types)
          ? data.types.join(", ")
          : "",
        address: data.address || "",
        city: data.city || "",
        phone: data.phone || "",
        about: data.about || "",
      });
    } catch (err) {
      console.error("Unable to load salon details:", err);
      setLoadError("Unable to load salon details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (fieldKey) => {
    setEditingField(fieldKey);
    setEditingValue(salonDetails[fieldKey] || "");
    setSaveMessage("");
  };

  const handleConfirmEdit = () => {
    if (!editingField) return;
    setSalonDetails((prev) => ({
      ...prev,
      [editingField]: editingValue,
    }));
    setEditingField(null);
    setEditingValue("");
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditingValue("");
  };

  const handleSaveChanges = async () => {
    if (!salonId) return;

    try {
      setSaving(true);
      setSaveMessage("");
      setLoadError(null);

      // Adjust this endpoint/method to match whatever you implement on the backend
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/salons/details/${salonId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(salonDetails),
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to save changes (${res.status})`);
      }

      const data = await res.json();
      console.log("SalonSettings saved:", data);
      setSaveMessage("Changes saved successfully.");
    } catch (err) {
      console.error("Error saving salon details:", err);
      setLoadError("There was a problem saving your changes.");
    } finally {
      setSaving(false);
    }
  };

  const renderEditableRow = (label, fieldKey, placeholder) => {
    const isEditing = editingField === fieldKey;

    return (
      <div className="settings-field-block">
        <div className="settings-label-row">
          <span className="settings-label">{label}</span>
          <button
            type="button"
            className="settings-edit-btn"
            onClick={() => handleEdit(fieldKey)}
          >
            <Pencil size={14} />
          </button>
        </div>

        {isEditing ? (
          <div className="settings-edit-area">
            <input
              className="settings-input"
              type="text"
              placeholder={placeholder}
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
            />
            <div className="settings-inline-buttons">
              <button
                type="button"
                className="settings-confirm-btn"
                onClick={handleConfirmEdit}
              >
                Confirm
              </button>
              <button
                type="button"
                className="settings-cancel-btn"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="settings-value-text">
            {salonDetails[fieldKey] || <span className="settings-placeholder">Not set</span>}
          </p>
        )}
      </div>
    );
  };

  const renderAboutRow = () => {
    const isEditing = editingField === "about";

    return (
      <div className="settings-field-block">
        <div className="settings-label-row">
          <span className="settings-label">About / Description</span>
          <button
            type="button"
            className="settings-edit-btn"
            onClick={() => handleEdit("about")}
          >
            <Pencil size={14} />
          </button>
        </div>

        {isEditing ? (
          <div className="settings-edit-area">
            <textarea
              className="settings-textarea"
              rows={4}
              placeholder="Share what makes your salon unique..."
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
            />
            <div className="settings-inline-buttons">
              <button
                type="button"
                className="settings-confirm-btn"
                onClick={handleConfirmEdit}
              >
                Confirm
              </button>
              <button
                type="button"
                className="settings-cancel-btn"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="settings-value-text multiline">
            {salonDetails.about || (
              <span className="settings-placeholder">
                Add a short description so customers know what to expect.
              </span>
            )}
          </p>
        )}
      </div>
    );
  };

  if (!salonId) {
    return (
      <div className="salon-settings-page">
        <div className="salon-settings-card">
          <h1 className="salon-settings-title">Settings</h1>
          <p className="settings-error">
            No salon selected. Try going back to your dashboard and opening settings
            again.
          </p>
          <div className="salon-settings-footer">
            <button className="settings-back-btn" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="salon-settings-page">
      <div className="salon-settings-card">
        <div className="salon-settings-header">
          <div>
            <h1 className="salon-settings-title">Salon Settings</h1>
            <p className="salon-settings-subtitle">
              Update how your salon appears to customers.
            </p>
          </div>
          {isLoading && (
            <div className="settings-loading-pill">
              <Loader2 className="settings-spinner" size={16} />
              <span>Loading</span>
            </div>
          )}
        </div>

        {loadError && <p className="settings-error">{loadError}</p>}
        {saveMessage && !loadError && (
          <p className="settings-success">{saveMessage}</p>
        )}

        {/* Basic Info Section */}
        <div className="settings-section">
          <h2 className="settings-section-title">Basic Info</h2>
          {renderEditableRow("Salon Name", "name", "e.g. Jade Beauty Bar")}
          {renderEditableRow(
            "Salon Type / Categories",
            "types",
            "e.g. Hair, Nails, Makeup"
          )}
        </div>

        {/* Location Section */}
        <div className="settings-section">
          <h2 className="settings-section-title">Location</h2>
          {renderEditableRow(
            "Street Address",
            "address",
            "123 Main Street, Suite 4B"
          )}
          {renderEditableRow("City", "city", "Newark, NJ")}
        </div>

        {/* Contact Section */}
        <div className="settings-section">
          <h2 className="settings-section-title">Contact</h2>
          {renderEditableRow("Phone", "phone", "(555) 123-4567")}
        </div>

        {/* About Section */}
        <div className="settings-section">
          <h2 className="settings-section-title">About</h2>
          {renderAboutRow()}
        </div>

        {/* Footer Buttons */}
        <div className="salon-settings-footer">
          <button
            type="button"
            className="settings-save-btn"
            onClick={handleSaveChanges}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="settings-spinner" size={16} />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SalonSettings;
