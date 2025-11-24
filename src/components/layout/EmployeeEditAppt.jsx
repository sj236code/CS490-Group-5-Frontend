// src/components/layout/EmployeeEditAppt.jsx
import { useState, useEffect } from "react";
import { X } from "lucide-react";

function EmployeeEditAppt({ isOpen, onClose, employeeId, appointment, onUpdated }) {
    const API_BASE = import.meta.env.VITE_API_URL;

    const [notes, setNotes] = useState(appointment?.notes || "");
    const [currentStatus, setCurrentStatus] = useState(appointment?.status || "SCHEDULED");
    const [selectedStatus, setSelectedStatus] = useState(appointment?.status || "SCHEDULED");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // When modal opens or appointment changes, sync local state
    useEffect(() => {
        if (!isOpen || !appointment) return;

        setNotes(appointment.notes || "");
        const status = appointment.status || "SCHEDULED";
        setCurrentStatus(status);
        setSelectedStatus(status);
        setError("");
    }, [isOpen, appointment]);

    const handleCloseInternal = () => {
        if (submitting) return;
        setError("");
        onClose && onClose();
    };

    const handleStatusClick = (status) => {setSelectedStatus(status);};

    const handleSave = async () => {
    setError("");

    if (!employeeId || !appointment?.id) {
        setError("Missing employee or appointment information.");
        return;
    }

    try {
        setSubmitting(true);

        const payload = {
        status: selectedStatus,
        notes: notes?.trim() || null,
        };

        const res = await fetch(
        `${API_BASE}/api/employeesapp/${employeeId}/appointments/${appointment.id}`,
        {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }
        );

        const data = await res.json();

        if (!res.ok) {
        console.error("Employee update appointment API error:", data);
        throw new Error(data.error || data.message || "Unable to update appointment.");
        }

        if (onUpdated) {
        onUpdated({
            id: appointment.id,
            status: selectedStatus,
            notes: notes?.trim() || "",
        });
        }

        handleCloseInternal();
    } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong while updating the appointment.");
    } finally {
        setSubmitting(false);
    }
    };

    if (!isOpen) return null;

    return (
    <div className="modal-overlay" onClick={handleCloseInternal}>
        <div
        className="modal-content book-appt-modal"
        onClick={(e) => e.stopPropagation()}
        >
        {/* HEADER */}
        <div className="book-appt-header">
            <button className="book-appt-back-btn" onClick={handleCloseInternal}>
            <X size={22} />
            </button>
            <h2 className="book-appt-title">Appointment Details</h2>
        </div>

        {/* SERVICE BAR */}
        <div className="book-appt-service-row">
            <div className="book-appt-service-name">
            {appointment?.serviceName || "Service"}
            </div>
            {appointment?.status && (
            <div className="book-appt-service-price">
                Status: {currentStatus}
            </div>
            )}
        </div>

        {/* MESSAGES */}
        {error && (
            <div className="book-appt-alert book-appt-alert-error">{error}</div>
        )}

        {/* MAIN CONTENT */}
        <div className="book-appt-grid">
            {/* LEFT: read-only info */}
            <div className="book-appt-column book-appt-column-left">
            <h3 className="book-appt-subtitle">Client</h3>
            <p className="book-appt-hint">
                {appointment?.customerName || "Customer"}
            </p>

            <h3 className="book-appt-subtitle" style={{ marginTop: "1rem" }}>
                Location
            </h3>
            <p className="book-appt-hint">
                {appointment?.location || "Salon"}
            </p>

            <h3 className="book-appt-subtitle" style={{ marginTop: "1rem" }}>
                Scheduled Time
            </h3>
            <p className="book-appt-hint">
                {appointment?.dateTime || "Date & time TBD"}
            </p>
            </div>

            {/* RIGHT: notes + status controls */}
            <div className="book-appt-column book-appt-column-right">
            <h3 className="book-appt-subtitle">Internal Notes</h3>
            <div className="book-appt-notes" style={{ marginBottom: "1rem" }}>
                <textarea
                className="book-appt-notes-textarea"
                placeholder="Add notes about this appointment…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                />
            </div>

            <h3 className="book-appt-subtitle">Update Status</h3>
            <div className="edit-employee-status-row">
                <button
                type="button"
                className={
                    "status-chip " +
                    (selectedStatus === "CHECKED_IN" ? "status-chip-active" : "")
                }
                onClick={() => handleStatusClick("CHECKED_IN")}
                >
                Check In
                </button>
                <button
                type="button"
                className={
                    "status-chip " +
                    (selectedStatus === "IN_PROGRESS" ? "status-chip-active" : "")
                }
                onClick={() => handleStatusClick("IN_PROGRESS")}
                >
                Start Service
                </button>
                <button
                type="button"
                className={
                    "status-chip " +
                    (selectedStatus === "COMPLETED" ? "status-chip-active" : "")
                }
                onClick={() => handleStatusClick("COMPLETED")}
                >
                Completed
                </button>
                <button
                type="button"
                className={
                    "status-chip status-chip-warn " +
                    (selectedStatus === "NO_SHOW" ? "status-chip-active" : "")
                }
                onClick={() => handleStatusClick("NO_SHOW")}
                >
                No-Show
                </button>
                <button
                type="button"
                className={
                    "status-chip status-chip-danger " +
                    (selectedStatus === "CANCELLED_BY_EMPLOYEE"
                    ? "status-chip-active"
                    : "")
                }
                onClick={() => handleStatusClick("CANCELLED_BY_EMPLOYEE")}
                >
                Cancel Appointment
                </button>
            </div>
            </div>
        </div>

        {/* FOOTER */}
        <div className="book-appt-footer">
            <button
                type="button"
                className="book-appt-cancel-btn"
                onClick={handleCloseInternal}
                disabled={submitting}
            >
                Close
            </button>
            <button
                type="button"
                className="book-appt-confirm-btn"
                onClick={handleSave}
                disabled={submitting}
            >
            {submitting ? "Saving…" : "Save Changes"}
            </button>
        </div>
        </div>
    </div>
    );
}

export default EmployeeEditAppt;
