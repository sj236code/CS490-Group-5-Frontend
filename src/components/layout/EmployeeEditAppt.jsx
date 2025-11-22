// src/components/layout/EmployeeEditAppt.jsx
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { addMinutes } from "date-fns";

function EmployeeEditAppt({ isOpen, onClose, employeeId, appointment, onUpdated }) {
    const API_BASE = import.meta.env.VITE_API_URL;

    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [notes, setNotes] = useState(appointment?.notes || "");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Pre-fill date/time from appointment.rawStart
    useEffect(() => {
    if (!isOpen || !appointment?.rawStart) return;

    try {
        const start = new Date(appointment.rawStart);
        const yyyy = start.getFullYear();
        const mm = String(start.getMonth() + 1).padStart(2, "0");
        const dd = String(start.getDate()).padStart(2, "0");
        const hh = String(start.getHours()).padStart(2, "0");
        const mi = String(start.getMinutes()).padStart(2, "0");

        setDate(`${yyyy}-${mm}-${dd}`);
        setTime(`${hh}:${mi}`);
        setNotes(appointment.notes || "");
        setError("");
    } catch (e) {
        console.error("Error parsing appointment start:", e);
    }
    }, [isOpen, appointment]);

    const handleCloseInternal = () => {
    if (submitting) return;
    setError("");
    onClose && onClose();
    };

    const handleSave = async () => {
    setError("");

    if (!employeeId || !appointment?.id) {
        setError("Missing employee or appointment information.");
        return;
    }

    if (!date || !time) {
        setError("Please select a date and time.");
        return;
    }

    try {
        setSubmitting(true);

        // Build start datetime from date + time
        const [hourStr, minuteStr] = time.split(":");
        const startDate = new Date(date);
        startDate.setHours(Number(hourStr), Number(minuteStr), 0, 0);

        // Compute duration from original start/end if possible
        let durationMinutes = 30;
        if (appointment.rawStart && appointment.rawEnd) {
        const origStart = new Date(appointment.rawStart);
        const origEnd = new Date(appointment.rawEnd);
        const diffMs = origEnd.getTime() - origStart.getTime();
        const diffMin = Math.round(diffMs / (1000 * 60));
        if (!isNaN(diffMin) && diffMin > 0) {
            durationMinutes = diffMin;
        }
        }

        const endDate = addMinutes(startDate, durationMinutes);

        const startIso = startDate.toISOString();
        const endIso = endDate.toISOString();

        const payload = {
        start_at: startIso,
        end_at: endIso,
        notes: notes?.trim() || null,
        // service_id could go here if you ever expose a "change service" UI
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
        console.error("Employee edit appointment API error:", data);
        throw new Error(data.error || data.message || "Unable to update appointment.");
        }

        // On success, let parent update its local state using the new start/end/notes
        if (onUpdated) {
        onUpdated({
            id: appointment.id,
            start_at: startIso,
            end_at: endIso,
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
            <h2 className="book-appt-title">Edit Appointment</h2>
        </div>

        {/* SERVICE BAR */}
        <div className="book-appt-service-row">
            <div className="book-appt-service-name">
            {appointment?.serviceName || "Service"}
            </div>
            {appointment?.status && (
            <div className="book-appt-service-price">
                Status: {appointment.status}
            </div>
            )}
        </div>

        {/* MESSAGES */}
        {error && (
            <div className="book-appt-alert book-appt-alert-error">{error}</div>
        )}

        {/* MAIN FORM (simple, no schedule logic here) */}
        <div className="book-appt-grid">
            {/* LEFT: Customer / meta info */}
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
            </div>

            {/* RIGHT: Editable date/time + notes */}
            <div className="book-appt-column book-appt-column-right">
            <h3 className="book-appt-subtitle">Date &amp; Time</h3>
            <div className="edit-employee-datetime-row">
                <label className="book-appt-notes-label">
                Date
                <input
                    type="date"
                    className="book-appt-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
                </label>

                <label className="book-appt-notes-label">
                Time
                <input
                    type="time"
                    className="book-appt-input"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                />
                </label>
            </div>

            <div className="book-appt-notes" style={{ marginTop: "1rem" }}>
                <label className="book-appt-notes-label">
                Internal Notes
                </label>
                <textarea
                className="book-appt-notes-textarea"
                placeholder="Add notes about this appointment…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                />
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
            Cancel
            </button>
            <button
            type="button"
            className="book-appt-confirm-btn"
            onClick={handleSave}
            disabled={submitting || !date || !time}
            >
            {submitting ? "Saving…" : "Save Changes"}
            </button>
        </div>
        </div>
    </div>
    );
}

export default EmployeeEditAppt;
