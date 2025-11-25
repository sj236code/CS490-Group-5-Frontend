// src/components/admin_dashboard/AdminSettings.jsx
import { useState, useEffect } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

function AdminSettings() {
  const location = useLocation();
  const navigate = useNavigate();

  // Expecting: navigate("/adminSettings", { state: { user, adminId }})
  const { user, adminId } = location.state || {};

  const effectiveAdminId =
    adminId ?? user?.profile_id ?? user?.id ?? user?.user_id ?? null;

  const [adminDetails, setAdminDetails] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    status: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  const loadAdminDetails = async () => {
    setSaveMessage("");
    setLoadError(null);
    setIsLoading(true);

    const url = `${import.meta.env.VITE_API_URL}/api/admin/details/${effectiveAdminId}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch admin details");
      }

      const json = await response.json();
      const data = json.data || json;

      setAdminDetails({
        first_name: data.first_name ?? user.first_name ?? "",
        last_name: data.last_name ?? user.last_name ?? "",
        email: data.email ?? user.email ?? "",
        phone_number: data.phone_number ?? user.phone_number ?? "",
        address: data.address ?? user.address ?? "",
        status: data.status ?? "",
      });
    } catch (err) {
      console.error("Error loading admin settings:", err);
      setLoadError("Unable to load your account details. Showing basic info.");
      setAdminDetails({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        address: user.address || "",
        status: "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && effectiveAdminId) {
      loadAdminDetails();
    }
  }, [user, effectiveAdminId]);

  const handleEdit = (fieldKey) => {
    setEditingField(fieldKey);
    setEditingValue(adminDetails[fieldKey] || "");
    setSaveMessage("");
  };

  const handleConfirmEdit = () => {
    if (!editingField) return;
    setAdminDetails((prev) => ({
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
    if (!effectiveAdminId) {
      setLoadError("We couldn't find your account ID.");
      return;
    }

    try {
      setSaving(true);
      setSaveMessage("");
      setLoadError(null);

      const payload = {
        first_name: adminDetails.first_name,
        last_name: adminDetails.last_name,
        // email is sent as-is, but admin cannot edit it in UI
        email: adminDetails.email,
        phone_number: adminDetails.phone_number,
        address: adminDetails.address,
        status: adminDetails.status,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/details/${effectiveAdminId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save admin settings");
      }

      const json = await response.json();
      const data = json.data || json;
      console.log("Admin settings saved:", json);

      // Immediately reflect whatever the backend says is the latest truth
      setAdminDetails((prev) => ({
        ...prev,
        first_name: data.first_name ?? prev.first_name,
        last_name: data.last_name ?? prev.last_name,
        // email not returned from PUT, so we keep prev.email
        email: data.email ?? prev.email,
        phone_number: data.phone_number ?? prev.phone_number,
        address: data.address ?? prev.address,
        status: data.status ?? prev.status,
      }));

      setSaveMessage("Your changes have been saved.");
      // If you ever want to re-pull from server:
      // await loadAdminDetails();
    } catch (err) {
      console.error("Error saving admin settings:", err);
      setLoadError("There was a problem saving your changes.");
    } finally {
      setSaving(false);
    }
  };

  const renderEditableRow = (label, fieldKey, placeholder, type = "text") => {
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
              type={type}
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
            {adminDetails[fieldKey] || (
              <span className="settings-placeholder">Not set</span>
            )}
          </p>
        )}
      </div>
    );
  };

  // Read-only row (for email)
  const renderReadOnlyRow = (label, fieldKey, placeholder) => {
    return (
      <div className="settings-field-block">
        <div className="settings-label-row">
          <span className="settings-label">{label}</span>
        </div>
        <p className="settings-value-text">
          {adminDetails[fieldKey] || (
            <span className="settings-placeholder">{placeholder}</span>
          )}
        </p>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="customer-settings-page">
        <div className="customer-settings-card">
          <h1 className="customer-settings-title">Account Settings</h1>
          <p className="settings-error">
            We couldn&apos;t find your account information. Try signing in again.
          </p>
          <div className="customer-settings-footer">
            <button
              className="settings-back-btn"
              type="button"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-settings-page">
      <div className="customer-settings-card">
        <div className="customer-settings-header">
          <div>
            <h1 className="customer-settings-title">Account Settings</h1>
            <p className="customer-settings-subtitle">
              Manage the details for your Jade admin account.
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

        {/* Basic Info */}
        <div className="settings-section">
          <h2 className="settings-section-title">Basic Info</h2>
          {renderEditableRow("First Name", "first_name", "e.g. Amina")}
          {renderEditableRow("Last Name", "last_name", "e.g. Khan")}
          {renderEditableRow("Status", "status", "e.g. active")}
        </div>

        {/* Contact Info */}
        <div className="settings-section">
          <h2 className="settings-section-title">Contact</h2>
          {/* EMAIL: VIEW ONLY, NO EDITING */}
          {renderReadOnlyRow("Email", "email", "you@example.com")}
          {/* Phone can be edited */}
          {renderEditableRow(
            "Phone Number",
            "phone_number",
            "(555) 123-4567"
          )}
        </div>

        {/* Address */}
        <div className="settings-section">
          <h2 className="settings-section-title">Address</h2>
          {renderEditableRow(
            "Street / City / Zip",
            "address",
            "123 Main St, Newark, NJ 07102"
          )}
        </div>

        {/* Footer */}
        <div className="customer-settings-footer">
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

export default AdminSettings;
