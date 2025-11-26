// src/components/layout/EmployeeEditAppt.jsx
import { useState, useEffect } from "react";
import { X } from "lucide-react";
//import "../App.css";

function EmployeeEditAppt({ isOpen, onClose, employeeId, appointment, onUpdated }) {
  const API_BASE = import.meta.env.VITE_API_URL;

  const [notes, setNotes] = useState(appointment?.notes || "");
  const [currentStatus, setCurrentStatus] = useState(appointment?.status || "SCHEDULED");
  const [selectedStatus, setSelectedStatus] = useState(appointment?.status || "SCHEDULED");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (!isOpen || !appointment) return;
    setNotes(appointment.notes || "");
    const status = appointment.status || "SCHEDULED";
    setCurrentStatus(status);
    setSelectedStatus(status);
    setError("");
    fetchAppointmentImages();
  }, [isOpen, appointment]); 

  const fetchAppointmentImages = async () => {
        if (!employeeId || !appointment?.id) return;
        setImagesLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/employeesapp/${employeeId}/appointments/${appointment.id}/images`);
            const data = await res.json();
            if (!res.ok) {
                console.error("Failed to fetch appointment images:", data);
                setImages([]);
                return;
            }
            setImages(data.images || []);
        } catch (err) {
            console.error("Error fetching appointment images:", err);
            setImages([]);
        } finally {
            setImagesLoading(false);
        }
  };

  const handleCloseInternal = () => {
    if (submitting) return;
    setError("");
    onClose && onClose();
  };

  const handleStatusClick = (status) => setSelectedStatus(status);

  const handleSave = async () => {
    setError("");
    if (!employeeId || !appointment?.id) {
      setError("Missing employee or appointment information.");
      return;
    }
    try {
      setSubmitting(true);
      const payload = { status: selectedStatus, notes: notes?.trim() || null };
      const res = await fetch(`${API_BASE}/api/employeesapp/${employeeId}/appointments/${appointment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Employee update appointment API error:", data);
        throw new Error(data.error || data.message || "Unable to update appointment.");
      }
      if (onUpdated) {
        onUpdated({ id: appointment.id, status: selectedStatus, notes: notes?.trim() || "" });
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
      <div className="modal-content book-appt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="book-appt-header">
          <button className="book-appt-back-btn" onClick={handleCloseInternal}><X size={22} /></button>
          <h2 className="book-appt-title">Appointment Details</h2>
        </div>

        <div className="book-appt-service-row">
          <div className="book-appt-service-name">{appointment?.serviceName || "Service"}</div>
          {appointment?.status && <div className="book-appt-service-price">Status: {currentStatus}</div>}
        </div>

        {error && <div className="book-appt-alert book-appt-alert-error">{error}</div>}

        <div className="book-appt-grid">
          <div className="book-appt-column book-appt-column-left">
            <h3 className="book-appt-subtitle">Client</h3>
            <p className="book-appt-hint">{appointment?.customerName || "Customer"}</p>

            <h3 className="book-appt-subtitle" style={{ marginTop: "1rem" }}>Location</h3>
            <p className="book-appt-hint">{appointment?.location || "Salon"}</p>

            <h3 className="book-appt-subtitle" style={{ marginTop: "1rem" }}>Scheduled Time</h3>
            <p className="book-appt-hint">{appointment?.dateTime || "Date & time TBD"}</p>
          </div>

          <div className="book-appt-column book-appt-column-right">
            <h3 className="book-appt-subtitle">Internal Notes</h3>
            <div className="book-appt-notes" style={{ marginBottom: "1rem" }}>
              <textarea className="book-appt-notes-textarea" placeholder="Add notes about this appointment…" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
            </div>

            <h3 className="book-appt-subtitle">Photos Attached</h3>
            {imagesLoading && <p className="book-appt-hint">Loading photos…</p>}
            {!imagesLoading && images.length === 0 && <p className="book-appt-hint">No photos attached for this appointment.</p>}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {images.map((img) => (
                    <div key={img.id} style={{ width: 110, height: 80, borderRadius: 6, overflow: "hidden", border: "1px solid #eee", position: "relative", cursor: "pointer" }} onClick={() => setPreviewImage(img.url)}>
                        <img src={img.url} alt={`appt-${img.id}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                ))}
            </div>

            <h3 className="book-appt-subtitle">Update Status</h3>
            <div className="edit-employee-status-row" style={{ marginBottom: 12 }}>
              <button type="button" className={"status-chip " + (selectedStatus === "CHECKED_IN" ? "status-chip-active" : "")} onClick={() => handleStatusClick("CHECKED_IN")}>Check In</button>
              <button type="button" className={"status-chip " + (selectedStatus === "IN_PROGRESS" ? "status-chip-active" : "")} onClick={() => handleStatusClick("IN_PROGRESS")}>Start Service</button>
              <button type="button" className={"status-chip " + (selectedStatus === "COMPLETED" ? "status-chip-active" : "")} onClick={() => handleStatusClick("COMPLETED")}>Completed</button>
              <button type="button" className={"status-chip status-chip-warn " + (selectedStatus === "NO_SHOW" ? "status-chip-active" : "")} onClick={() => handleStatusClick("NO_SHOW")}>No-Show</button>
              <button type="button" className={"status-chip status-chip-danger " + (selectedStatus === "CANCELLED_BY_EMPLOYEE" ? "status-chip-active" : "")} onClick={() => handleStatusClick("CANCELLED_BY_EMPLOYEE")}>Cancel Appointment</button>
            </div>
          </div>
        </div>

        <div className="book-appt-footer">
          <button type="button" className="book-appt-cancel-btn" onClick={handleCloseInternal} disabled={submitting}>Close</button>
          <button type="button" className="book-appt-confirm-btn" onClick={handleSave} disabled={submitting}>{submitting ? "Saving…" : "Save Changes"}</button>
        </div>
      </div>

      {previewImage && (
        <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
          <div className="modal-content" style={{ maxWidth: 900, maxHeight: "80vh", padding: 12 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setPreviewImage(null)} className="btn-small">Close</button>
            </div>
            <div style={{ textAlign: "center" }}>
              <img src={previewImage} alt="preview" style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeEditAppt;
