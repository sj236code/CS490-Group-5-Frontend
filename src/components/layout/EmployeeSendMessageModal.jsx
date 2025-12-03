import { useState, useEffect } from "react";
import { X, Mail } from "lucide-react";

function EmployeeSendMessageModal({ isOpen, onClose, appointment }) {
    const API_BASE = import.meta.env.VITE_API_URL;

    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!isOpen) return;
        // Reset state each time the modal opens or appointment changes
        setMessage("");
        setError("");
        setSuccess("");
    }, [isOpen, appointment]);

    if (!isOpen || !appointment) return null;

    const handleCloseInternal = () => {
        if (submitting) return;
        setError("");
        setSuccess("");
        onClose && onClose();
    };

    const handleSend = async () => {
        setError("");
        setSuccess("");

        if (!appointment?.id) {
        setError("Missing appointment information.");
        return;
        }

        const trimmed = message.trim();
        if (!trimmed) {
        setError("Please enter a message before sending.");
        return;
        }

        try {
        setSubmitting(true);

        const payload = {
            appointment_id: appointment.id,
            from_user_type: "employee",
            message: trimmed,
        };

        const res = await fetch(
            `${API_BASE}/api/notifications/appointment/message`,
            {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            }
        );

        let data = null;
        try {
            data = await res.json();
        } catch {
            // If response body is empty or not JSON, ignore parsing error
        }

        if (!res.ok) {
            console.error("Send appointment message error:", data);
            const serverMessage =
            data?.error || data?.message || "Unable to send message.";
            throw new Error(serverMessage);
        }

        setSuccess("Message sent successfully. The customer will receive an email.");
        // setTimeout(() => handleCloseInternal(), 1200);
        } catch (err) {
        console.error(err);
        setError(
            err.message || "Something went wrong while sending the message."
        );
        } finally {
        setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={handleCloseInternal}>
        <div
            className="modal-content book-appt-modal"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="book-appt-header">
            <button
                className="book-appt-back-btn"
                type="button"
                onClick={handleCloseInternal}
            >
                <X size={22} />
            </button>
            <h2 className="book-appt-title">Send Message to Customer</h2>
            </div>

            {/* Small summary row */}
            <div className="book-appt-service-row">
            <div className="book-appt-service-name">
                {appointment?.serviceName || "Service"}
            </div>
            <div className="book-appt-service-price">
                {appointment?.dateTime || "Date & time TBD"}
            </div>
            </div>

            {error && (
            <div className="book-appt-alert book-appt-alert-error">
                {error}
            </div>
            )}

            {success && (
            <div className="book-appt-alert book-appt-alert-success">
                {success}
            </div>
            )}

            <div className="book-appt-grid">
            {/* Left column: context */}
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

                <p className="book-appt-hint" style={{ marginTop: "1.25rem" }}>
                This message will be emailed to the client using the email on
                file. They can reply directly from their inbox.
                </p>
            </div>

            {/* Right column: message input */}
            <div className="book-appt-column book-appt-column-right">
                <h3 className="book-appt-subtitle">
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Mail size={18} /> Message
                </span>
                </h3>
                <div className="book-appt-notes" style={{ marginBottom: "1rem" }}>
                <textarea
                    className="book-appt-notes-textarea"
                    rows={6}
                    placeholder="Write a message to the customer about this appointment…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                </div>
            </div>
            </div>

            {/* Footer buttons */}
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
                onClick={handleSend}
                disabled={submitting}
            >
                {submitting ? "Sending…" : "Send Message"}
            </button>
            </div>
        </div>
        </div>
    );
}

export default EmployeeSendMessageModal;
