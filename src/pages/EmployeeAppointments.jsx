// src/pages/EmployeeAppointments.jsx
import React, { useState, useEffect } from "react";
import { MapPin, Calendar, User } from "lucide-react";
import { useLocation } from "react-router-dom";
import EmployeeEditAppt from "../components/layout/EmployeeEditAppt";
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
      const res = await fetch(
        `${API_BASE}/api/employeesapp/${employeeId}/appointments/${appt.id}/cancel`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}), 
          // body: JSON.stringify({ reason: "Cancelled via schedule" }),
        }
      );

      const raw = await res.text();
      let data = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        // non-JSON (e.g. HTML error page) – keep raw for logging
      }

      if (!res.ok) {
        console.error("Failed to cancel appointment:", data || raw);
        return;
      }

      // success -> remove from upcoming list in UI
      setUpcomingAppointments((prev) =>
        prev.filter((a) => a.id !== appt.id)
      );
    } 
    catch (err) {
      console.error("Error cancelling appointment:", err);
    }
  };

  // Load upcoming appointments for this employee
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

  // Load previous appointments for this employee
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

  return (
    <div className="appointments-container">
      {/* Header */}
      <header className="jade-header">
        <h1>My Schedule</h1>
      </header>

      {/* Upcoming Section */}
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
              {appt.status && (
                <p className="appt-customer">Status: {appt.status}</p>
              )}
              {appt.notes && (
                <p className="appt-notes">
                  <strong>Notes:</strong> {appt.notes}
                </p>
              )}
            </div>

            <div className="appt-buttons">
              <button className="btn-send" type="button" disabled>
                Send Message
              </button>
              <button
                className="btn-edit"
                type="button"
                onClick={() => handleEditClick(appt)}
              >
                Edit
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

      {/* Previous Section */}
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
              {appt.status && (
                <p className="appt-customer">Status: {appt.status}</p>
              )}
              {appt.notes && (
                <p className="appt-notes">
                  <strong>Notes:</strong> {appt.notes}
                </p>
              )}
            </div>

            <div className="appt-buttons">
              <button className="btn-send" type="button" disabled>
                Send Message
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Edit Modal */}
      {showEditModal && selectedAppt && (
        <EmployeeEditAppt
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          employeeId={employeeId}
          appointment={selectedAppt}
          onUpdated={(updated) => {
            // Update upcoming list so UI reflects changes
            setUpcomingAppointments((prev) =>
              prev.map((appt) =>
                appt.id === updated.id
                  ? {
                      ...appt,
                      rawStart: updated.start_at,
                      rawEnd: updated.end_at,
                      dateTime: formatApptDateTime(updated.start_at),
                      notes: updated.notes ?? "",
                    }
                  : appt
              )
            );
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
          }}
        />
      )}

      {/* Success Popup */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="success-box">
            <h3>Saved</h3>
            <p className="booking-updated">Appointment Updated</p>
            <p>Your changes have been successfully saved.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAppointments;
