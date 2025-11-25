// src/components/employee_dashboard/EmployeeSettings.jsx
import { useState, useEffect } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

function EmployeeSettings() {
  const location = useLocation();
  const navigate = useNavigate();

  // Expecting something like:
  // navigate("/employeeSettings", { state: { user, employeeId }})
  const { user, customerId, employeeId } = location.state || {};

  const effectiveEmployeeId =
    employeeId ?? customerId ?? user?.profile_id ?? user?.id ?? user?.user_id ?? null;

  const [employeeDetails, setEmployeeDetails] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    employment_status: "",
    employee_type: "",
    salon_id: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  const loadEmployeeDetails = async () => {
    setSaveMessage("");
    setLoadError(null);
    setIsLoading(true);

    const url = `${import.meta.env.VITE_API_URL}/api/employee/details/${effectiveEmployeeId}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch employee details");
      }

      const json = await response.json();
      // Backend returns { status, data: {...} }
      const data = json.data || json;

      setEmployeeDetails({
        first_name: data.first_name ?? user.first_name ?? "",
        last_name: data.last_name ?? user.last_name ?? "",
        email: data.email ?? user.email ?? "",
        phone_number: data.phone_number ?? user.phone_number ?? "",
        address: data.address ?? user.address ?? "",
        employment_status: data.employment_status ?? "",
        employee_type: data.employee_type ?? "",
        salon_id: data.salon_id ?? "",
      });
    } catch (err) {
      console.error("Error loading employee settings:", err);
      setLoadError("Unable to load your account details. Showing basic info.");
      setEmployeeDetails({
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        email: user?.email || "",
        phone_number: user?.phone_number || "",
        address: user?.address || "",
        employment_status: "",
        employee_type: "",
        salon_id: "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && effectiveEmployeeId) {
      loadEmployeeDetails();
    }
  }, [user, effectiveEmployeeId]);

  const handleEdit = (fieldKey) => {
    setEditingField(fieldKey);
    setEditingValue(employeeDetails[fieldKey] || "");
    setSaveMessage("");
  };

  const handleConfirmEdit = () => {
    if (!editingField) return;
    setEmployeeDetails((prev) => ({
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
    if (!effectiveEmployeeId) {
      setLoadError("We couldn't find your account ID.");
      return;
    }

    try {
      setSaving(true);
      setSaveMessage("");
      setLoadError(null);

      const payload = {
        first_name: employeeDetails.first_name,
        last_name: employeeDetails.last_name,
        // email is sent as-is, but user cannot edit it in UI
        email: employeeDetails.email,
        phone_number: employeeDetails.phone_number,
        address: employeeDetails.address,
        // These are restricted in UI but still sent as current values
        employment_status: employeeDetails.employment_status,
        employee_type: employeeDetails.employee_type,
        salon_id: employeeDetails.salon_id,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/employee/details/${effectiveEmployeeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save employee settings");
      }

      const json = await response.json();
      const data = json.data || json;
      console.log("Employee settings saved:", json);

      // Immediately reflect backend's source-of-truth
      setEmployeeDetails((prev) => ({
        ...prev,
        first_name: data.first_name ?? prev.first_name,
        last_name: data.last_name ?? prev.last_name,
        email: data.email ?? prev.email,
        phone_number: data.phone_number ?? prev.phone_number,
        address: data.address ?? prev.address,
        employment_status: data.employment_status ?? prev.employment_status,
        employee_type: data.employee_type ?? prev.employee_type,
        salon_id: data.salon_id ?? prev.salon_id,
      }));

      setSaveMessage("Your changes have been saved.");
    } catch (err) {
      console.error("Error saving employee settings:", err);
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
            {employeeDetails[fieldKey] || (
              <span className="settings-placeholder">Not set</span>
            )}
          </p>
        )}
      </div>
    );
  };

  // Read-only row (for email + restricted fields)
  const renderReadOnlyRow = (label, fieldKey, placeholder) => {
    return (
      <div className="settings-field-block">
        <div className="settings-label-row">
          <span className="settings-label">{label}</span>
        </div>
        <p className="settings-value-text">
          {employeeDetails[fieldKey] || (
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
              Manage the details for your Jade employee account.
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
        </div>

        {/* Employment Info (READ-ONLY) */}
        <div className="settings-section">
          <h2 className="settings-section-title">Employment</h2>
          {renderReadOnlyRow(
            "Employment Status",
            "employment_status",
            "e.g. active"
          )}
          {renderReadOnlyRow(
            "Employee Type",
            "employee_type",
            "e.g. stylist"
          )}
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

        {/* Salon Info (READ-ONLY) */}
        <div className="settings-section">
          <h2 className="settings-section-title">Salon</h2>
          {renderReadOnlyRow("Salon ID", "salon_id", "e.g. 12")}
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
