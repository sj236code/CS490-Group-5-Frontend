// src/components/customer_dashboard/CustomerSettings.jsx
import { useState, useEffect } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

function EmployeeSettings() {
  const location = useLocation();
  const navigate = useNavigate();

  // Expecting: navigate("/customerSettings", { state: { user, customerId }})
  const { user, customerId } = location.state || {};

  const effectiveCustomerId =
    customerId ?? user?.profile_id ?? user?.id ?? user?.user_id ?? null;

  const [customerDetails, setCustomerDetails] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  // Load initial from user-type response for now (no real endpoint yet)
  useEffect(() => {
    setSaveMessage("");
    setLoadError(null);

    if (!user) return;

    // GET /api/customers/details/<effectiveCustomerId>
    setIsLoading(true);
    try {
      setCustomerDetails({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        address: user.address || "",
      });
    } catch (err) {
      console.error("Error loading customer settings:", err);
      setLoadError("Unable to load your account details.");
    } finally {
      setIsLoading(false);
    }
  }, [user, effectiveCustomerId]);

  const handleEdit = (fieldKey) => {
    setEditingField(fieldKey);
    setEditingValue(customerDetails[fieldKey] || "");
    setSaveMessage("");
  };

  const handleConfirmEdit = () => {
    if (!editingField) return;
    setCustomerDetails((prev) => ({
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
    // e.g. PUT /api/customers/details/<effectiveCustomerId>

    try {
      setSaving(true);
      setSaveMessage("");
      setLoadError(null);

      console.log("Mock save of customer settings:", {
        customer_id: effectiveCustomerId,
        ...customerDetails,
      });

      // TEMP: pretend save is successful
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSaveMessage("Your changes have been saved.");
    } catch (err) {
      console.error("Error saving customer settings:", err);
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
            {customerDetails[fieldKey] || (
              <span className="settings-placeholder">Not set</span>
            )}
          </p>
        )}
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
              Manage the details for your Jade customer account.
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
          {renderEditableRow(
            "First Name",
            "first_name",
            "e.g. Amina"
          )}
          {renderEditableRow(
            "Last Name",
            "last_name",
            "e.g. Khan"
          )}
        </div>

        {/* Contact Info */}
        <div className="settings-section">
          <h2 className="settings-section-title">Contact</h2>
          {renderEditableRow(
            "Email",
            "email",
            "you@example.com",
            "email"
          )}
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

export default EmployeeSettings;