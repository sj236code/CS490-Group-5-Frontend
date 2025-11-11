import React, { useState } from "react";

const EditEmpApptModal = ({
  employeeId,
  appointment,
  onClose,
  onSaved,
  onDelete,
}) => {
  const [startAt, setStartAt] = useState(
    toLocalInputValue(appointment.startAt)
  );
  const [endAt, setEndAt] = useState(
    toLocalInputValue(appointment.endAt)
  );
  const [notes, setNotes] = useState(appointment.notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toLocalInputValue(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  const handleSave = async () => {
    setSaving(true);
    setError("");

    const payload = {
      start_at: startAt ? new Date(startAt).toISOString() : null,
      end_at: endAt ? new Date(endAt).toISOString() : null,
      notes: notes,
    };

    try {
      const url = `${import.meta.env.VITE_API_URL}/api/employeesapp/${employeeId}/appointments/${appointment.id}`;
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Failed to update employee appointment:", errData);
        setError(errData.error || "Failed to update appointment");
        setSaving(false);
        return;
      }

      // Build a backend-shaped object so parent can reuse mapAppointment
      const updatedFromBackendShape = {
        appointment_id: appointment.id,
        service_name: appointment.serviceName,
        salon_name: appointment.location,
        start_at: payload.start_at || appointment.startAt,
        end_at: payload.end_at || appointment.endAt,
        customer_name: appointment.customerName,
        status: appointment.status,
        notes: notes,
      };

      onSaved(updatedFromBackendShape);
    } catch (err) {
      console.error("Error updating employee appointment:", err);
      setError("Unexpected error updating appointment");
      setSaving(false);
    }
  };

  const handleDeleteClick = () => {
    onDelete(appointment.id);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3 className="modal-title">Edit Appointment</h3>

        <label>Service</label>
        <div className="service-select disabled-select">
          {appointment.serviceName}
        </div>

        <label>Date &amp; Time (Start)</label>
        <input
          type="datetime-local"
          className="datetime-input"
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
        />

        <label>Date &amp; Time (End)</label>
        <input
          type="datetime-local"
          className="datetime-input"
          value={endAt}
          onChange={(e) => setEndAt(e.target.value)}
        />

        <label>Notes</label>
        <textarea
          className="notes-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes for this appointment..."
        />

        {error && <p className="error-text">{error}</p>}

        <div className="modal-buttons">
          <button
            className="btn-delete"
            type="button"
            onClick={handleDeleteClick}
            disabled={saving}
          >
            Cancel Appt
          </button>
          <button
            className="btn-save"
            type="button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            className="btn-cancel-secondary"
            type="button"
            onClick={onClose}
            disabled={saving}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEmpApptModal;
