import React, { useState } from "react";
import { X, Check, UserCheck, UserX } from "lucide-react";

function EditEmployeeStatus({ employee, onClose, onStatusUpdated }) {
    if (!employee) return null;

    const rawStatus = (employee.employment_status || "").toUpperCase();

    const [selectedStatus, setSelectedStatus] = useState(
        rawStatus === "INACTIVE" ? "APPROVED" : rawStatus
    );

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleSave = async () => {
        try {
        setIsSaving(true);
        setError(null);

        const API_URL = import.meta.env.VITE_API_URL;

        const res = await fetch(
            `${API_URL}/api/employee/verification/${employee.id}`,
            {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ employment_status: selectedStatus }),
            }
        );

        const data = await res.json();

        if (!res.ok) {
            console.error("Failed to update employee status:", data);
            setError(data.message || "Failed to update status");
            return;
        }

        if (onStatusUpdated) {
            onStatusUpdated(employee.id, selectedStatus);
        }

        onClose();
        } catch (err) {
        console.error("Error updating employee status:", err);
        setError("Error updating status");
        } finally {
        setIsSaving(false);
        }
    };

    const displayStatusLabel =
        rawStatus === "INACTIVE"
        ? "Pending"
        : rawStatus.charAt(0) + rawStatus.slice(1).toLowerCase();

    return (
        <div className="error-modal-backdrop">
        <div className="error-modal employee-status-modal">
            <button
            type="button"
            className="error-modal-close"
            onClick={onClose}
            aria-label="Close"
            >
            <X size={18} />
            </button>

            <h2 className="employee-status-modal-title">Edit Employee Status</h2>

            <p className="employee-status-modal-subtitle">
            {employee.first_name} {employee.last_name} (ID #{employee.id})
            </p>

            <div className="employee-status-modal-row">
            <span className="employee-status-modal-label">Current status:</span>
            <span className="employee-status-modal-pill">
                {displayStatusLabel}
            </span>
            </div>

            <div className="employee-status-modal-row">
            <label
                htmlFor="employeeStatusSelect"
                className="employee-status-modal-label"
            >
                New status:
            </label>

            <select
                id="employeeStatusSelect"
                className="employee-status-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
            >
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
            </select>
            </div>

            {error && <p className="employee-status-modal-error">{error}</p>}

            <div className="employee-status-modal-footer">
            <button
                type="button"
                className="settings-cancel-btn"
                onClick={onClose}
                disabled={isSaving}
            >
                <X size={14} />
                Cancel
            </button>

            <button
                type="button"
                className="settings-confirm-btn"
                onClick={handleSave}
                disabled={isSaving}
            >
                {isSaving ? (
                "Saving..."
                ) : (
                <>
                    <Check size={14} />
                    Save status
                </>
                )}
            </button>
            </div>
        </div>
        </div>
    );
}

export default EditEmployeeStatus;
