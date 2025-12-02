import React, { useState, useEffect } from "react";
import { MapPin, Calendar, User } from "lucide-react";
import { useLocation } from "react-router-dom";
import EmployeeEditAppt from "../components/layout/EmployeeEditAppt";
import EmployeeSendMessageModal from "../components/layout/EmployeeSendMessageModal";
import "../App.css";

const EmployeeAppointments = () => {
  const API_BASE = import.meta.env.VITE_API_URL;

  const location = useLocation();
  const userFromState = location.state?.user;
  const employeeId = userFromState?.profile_id ?? null;

  console.log("Employee id:", employeeId);
  console.log("User (employee): ", location.state?.user);

  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [previousAppointments, setPreviousAppointments] = useState([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageAppt, setMessageAppt] = useState(null);

  const [showCancelNotice, setShowCancelNotice] = useState(false);

  const formatApptDateTime = (isoString) => {
    if (!isoString) return "Date & time TBD";
    const d = new Date(isoString);
    const datePart = d.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const timePart = d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${datePart} at ${timePart}`;
  };

  const handleEditClick = (appt) => {
    setSelectedAppt(appt);
    setShowEditModal(true);
  };

  const handleCancelClick = async (appt) => {
    if (!employeeId) return;

    try {
      // Cancel app in db
      const res = await fetch(
        `${API_BASE}/api/employeesapp/${employeeId}/appointments/${appt.id}/cancel`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}), 
        }
      );

      const raw = await res.text();
      let data = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {

      }

      if (!res.ok) {
        console.error("Failed to cancel appointment:", data || raw);
        return;
      }

      // Send cancellation email notif
      try {
        const notifyRes = await fetch(`${API_BASE}/api/notifications/appointment/cancel`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              appointment_id: appt.id,
              cancelled_by: "employee",
              reason: "Appointment cancelled by staff via employee portal.",
            }),
          }
        );

        let notifyData = null;
        try {
          notifyData = await notifyRes.json();
        } catch {}

        if (!notifyRes.ok) {
          console.error(
            "Failed to send cancellation email:",
            notifyData || "Unknown error"
          );
        }
      } 
      catch (notifyErr) {
        console.error("Error calling cancellation email endpoint:", notifyErr);
      }

      // Remove from upcoming appts
      setUpcomingAppointments((prev) =>
        prev.filter((a) => a.id !== appt.id)
      );

      // Immediately set to prev appts
      setPreviousAppointments((prev) => [
        {
          ...appt,
          status: "CANCELLED",
        },
        ...prev,
      ]);

      setShowCancelNotice(true);
      setTimeout(() => setShowCancelNotice(false), 2000);
    } 
    catch (err) {
      console.error("Error cancelling appointment:", err);
    }
  };

  useEffect(() => {
    if (!employeeId) return;

    const fetchUpcomingAppointments = async () => {
      try {
        const url = `${API_BASE}/api/employeesapp/${employeeId}/appointments/upcoming`;
        const res = await fetch(url);

        if (res.status === 404) {
          console.error("Employee not found");
          setUpcomingAppointments([]);
          return;
        }

        if (!res.ok) {
          console.error("Failed to fetch upcoming employee appointments");
          setUpcomingAppointments([]);
          return;
        }

        const data = await res.json();
        console.log("Employee upcoming appointments from backend:", data);

        const mapped = (data || []).map((apt) => ({
          id: apt.appointment_id,
          serviceName: apt.service_name || "Service",
          location: apt.salon_name || "Salon",
          dateTime: formatApptDateTime(apt.start_at),
          customerName: apt.customer_name || "Customer",
          status: apt.status,
          notes: apt.notes || "",
          rawStart: apt.start_at,
          rawEnd: apt.end_at,
        }));

        setUpcomingAppointments(mapped);
      } 
      catch (err) {
        console.error("Error fetching upcoming employee appointments:", err);
        setUpcomingAppointments([]);
      }
    };

    fetchUpcomingAppointments();
  }, [employeeId, API_BASE]);

  useEffect(() => {
    if (!employeeId) return;

    const fetchPreviousAppointments = async () => {
      try {
        const url = `${API_BASE}/api/employeesapp/${employeeId}/appointments/previous`;
        const res = await fetch(url);

        if (res.status === 404) {
          console.error("Employee not found");
          setPreviousAppointments([]);
          return;
        }

        if (!res.ok) {
          console.error("Failed to fetch previous employee appointments");
          setPreviousAppointments([]);
          return;
        }

        const data = await res.json();
        console.log("Employee previous appointments from backend:", data);

        const mapped = (data || []).map((apt) => ({
          id: apt.appointment_id,
          serviceName: apt.service_name || "Service",
          location: apt.salon_name || "Salon",
          dateTime: formatApptDateTime(apt.start_at),
          customerName: apt.customer_name || "Customer",
          status: apt.status,
          notes: apt.notes || "",
          rawStart: apt.start_at,
          rawEnd: apt.end_at,
        }));

        setPreviousAppointments(mapped);
      } catch (err) {
        console.error("Error fetching previous employee appointments:", err);
        setPreviousAppointments([]);
      }
    };

    fetchPreviousAppointments();
  }, [employeeId, API_BASE]);

  const StatusBadge = ({ status }) => {
    if (!status) return null;

    const normalized = status.toUpperCase();

    let variantClass = "status-badge-booked";
    switch (normalized) {
      case "CONFIRMED":
        variantClass = "status-badge-confirmed";
        break;
      case "CHECKED_IN":
        variantClass = "status-badge-checked-in";
        break;
      case "IN_PROGRESS":
        variantClass = "status-badge-in-progress";
        break;
      case "COMPLETED":
        variantClass = "status-badge-completed";
        break;
      case "NO_SHOW":
        variantClass = "status-badge-no-show";
        break;
      case "CANCELLED":
      case "CANCELLED_BY_EMPLOYEE":
        variantClass = "status-badge-cancelled";
        break;
      default:
        variantClass = "status-badge-booked";
    }

    return (
      <span className={`status-badge ${variantClass}`}>
        {normalized.replace(/_/g, " ")}
      </span>
    );
  };

  const handleSendMessageClick = (appt) => {
    setMessageAppt(appt);
    setShowMessageModal(true);
  };


  return (
    <div className="appointments-container">
      <header className="jade-header">
        <h1>My Schedule</h1>
      </header>

      <section>
        <h2 className="section-title">Upcoming</h2>
        {upcomingAppointments.length === 0 && (
          <p className="book-appt-hint">No upcoming appointments.</p>
        )}
        {upcomingAppointments.map((appt) => (
          <div key={appt.id} className="appointment-card">
            <div className="appt-info">
              <h3>{appt.serviceName}</h3>
              <p>
                <MapPin size={16} style={{ marginRight: "6px" }} />
                {appt.location}
              </p>
              <p>
                <Calendar size={16} style={{ marginRight: "6px" }} />
                {appt.dateTime}
              </p>
              <p>
                <User size={16} style={{ marginRight: "6px" }} />
                {appt.customerName}
              </p>
              {appt.notes && (
                <p className="appt-notes">
                  <strong>Notes:</strong> {appt.notes}
                </p>
              )}
              {appt.status && (
                <div className="appt-status-wrapper">
                  <StatusBadge status={appt.status} />
                </div>
              )}
            </div>

            <div className="appt-buttons">
              <button className="btn-send" type="button" onClick={() => handleSendMessageClick(appt)}>
                Send Message
              </button>
              <button
                className="btn-edit"
                type="button"
                onClick={() => handleEditClick(appt)}
              >
                Details 
              </button>
              <button
                className="btn-cancel"
                type="button"
                onClick={() => handleCancelClick(appt)}
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="section-title">Previous</h2>
        {previousAppointments.length === 0 && (
          <p className="book-appt-hint">No previous appointments.</p>
        )}
        {previousAppointments.map((appt) => (
          <div key={appt.id} className="appointment-card">
            <div className="appt-info">
              <h3>{appt.serviceName}</h3>
              <p>
                <MapPin size={16} style={{ marginRight: "6px" }} />
                {appt.location}
              </p>
              <p>
                <Calendar size={16} style={{ marginRight: "6px" }} />
                {appt.dateTime}
              </p>
              <p>
                <User size={16} style={{ marginRight: "6px" }} />
                {appt.customerName}
              </p>
              {appt.notes && (
                <p className="appt-notes">
                  <strong>Notes:</strong> {appt.notes}
                </p>
              )}
              {appt.status && (
                <div className="appt-status-wrapper">
                  <StatusBadge status={appt.status} />
                </div>
              )}
            </div>

            <div className="appt-buttons">
              <button className="btn-send" type="button" onClick={() => handleSendMessageClick(appt)}>
                Send Message
              </button>
            </div>
          </div>
        ))}
      </section>

      {showEditModal && selectedAppt && (
        <EmployeeEditAppt
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          employeeId={employeeId}
          appointment={selectedAppt}
          onUpdated={(updated) => {
            setUpcomingAppointments((prev) =>
              prev.map((appt) =>
                appt.id === updated.id
                  ? {
                      ...appt,
                      status: updated.status,
                      notes: updated.notes ?? "",
                    }
                  : appt
              )
            );

            setSelectedAppt((prev) =>
              prev && prev.id === updated.id
                ? { ...prev, status: updated.status, notes: updated.notes ?? "" }
                : prev
            );

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
          }}
        />
      )}

      {showSuccess && (
        <div className="modal-overlay">
          <div className="success-box">
            <h3>Saved</h3>
            <p className="booking-updated">Appointment Updated</p>
            <p>Your changes have been successfully saved.</p>
          </div>
        </div>
      )}

      {showMessageModal && messageAppt && (
        <EmployeeSendMessageModal
          isOpen={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
            setMessageAppt(null);
          }}
          appointment={messageAppt}
        />
      )}

      {showCancelNotice && (
        <div className="modal-overlay">
          <div className="success-box">
            <h3>Cancellation Email Sent</h3>
            <p className="booking-updated">Email sent to customer</p>
            <p>The customer has been notified about this cancellation.</p>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default EmployeeAppointments;
