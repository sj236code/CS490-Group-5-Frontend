import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MapPin, Calendar, User } from "lucide-react";
import EditEmpApptModal from "../components/layout/EditEmpApptModal";
import "../App.css";

const EmployeeAppointments = () => {
  const location = useLocation();
  const userFromState = location.state?.user;
  const userIdFromState = location.state?.userId;

  const employeeId = userFromState?.profile_id ?? userIdFromState ?? null;

  console.log("Employee id:", employeeId);
  console.log("Location state:", location.state);

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

  // Map backend appointment → shape used in UI + modal
  const mapAppointment = (apt) => ({
    id: apt.appointment_id,
    serviceName: apt.service_name || "Service",
    location: apt.salon_name || "Salon",
    dateTime: formatApptDateTime(apt.start_at),

    // From the employee's perspective:
    staffName: "You",
    customerName: apt.customer_name || "Customer",

    // extra fields for editing
    startAt: apt.start_at,
    endAt: apt.end_at,
    status: apt.status,
    notes: apt.notes,
  });

  // Load upcoming appointments
  useEffect(() => {
    if (!employeeId) return;

    const fetchUpcomingAppointments = async () => {
      try {
        const url = `${import.meta.env.VITE_API_URL}/api/employeesapp/${employeeId}/appointments/upcoming`;
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

        const mapped = data.map(mapAppointment);
        setUpcomingAppointments(mapped);
      } catch (err) {
        console.error("Error fetching upcoming employee appointments:", err);
        setUpcomingAppointments([]);
      }
    };

    fetchUpcomingAppointments();
  }, [employeeId]);

  // Load previous appointments
  useEffect(() => {
    if (!employeeId) return;

    const fetchPreviousAppointments = async () => {
      try {
        const url = `${import.meta.env.VITE_API_URL}/api/employeesapp/${employeeId}/appointments/previous`;
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

        const mapped = data.map(mapAppointment);
        setPreviousAppointments(mapped);
      } catch (err) {
        console.error("Error fetching previous employee appointments:", err);
        setPreviousAppointments([]);
      }
    };

    fetchPreviousAppointments();
  }, [employeeId]);

  // --- Handlers ---

  const handleEditClick = (appt) => {
    setSelectedAppt(appt);
    setShowEditModal(true);
  };

  const handleEditSaved = (updatedFromBackend) => {
    const updatedMapped = mapAppointment(updatedFromBackend);

    setUpcomingAppointments((prev) =>
      prev.map((appt) =>
        appt.id === updatedMapped.id ? updatedMapped : appt
      )
    );

    setPreviousAppointments((prev) =>
      prev.map((appt) =>
        appt.id === updatedMapped.id ? updatedMapped : appt
      )
    );

    setShowEditModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleCancelClick = async (apptId) => {
    if (!employeeId) return;

    try {
      const url = `${import.meta.env.VITE_API_URL}/api/employeesapp/${employeeId}/appointments/${apptId}/cancel`;
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: "Cancelled by employee via dashboard",
        }),
      });

      if (!res.ok) {
        console.error("Failed to cancel appointment for employee");
        return;
      }

      // Remove from upcoming list in UI
      setUpcomingAppointments((prev) =>
        prev.filter((appt) => appt.id !== apptId)
      );
    } catch (err) {
      console.error("Error cancelling employee appointment:", err);
    }
  };

  const handleDeleteFromModal = async (apptId) => {
    await handleCancelClick(apptId);
    setShowEditModal(false);
  };

  const handleSendMessageClick = async (appt) => {
    if (!employeeId) return;

    const body = window.prompt(
      `Message to ${appt.customerName}:`,
      ""
    );
    if (!body) return;

    try {
      const url = `${import.meta.env.VITE_API_URL}/api/employeesapp/${employeeId}/appointments/${appt.id}/message`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body }),
      });

      if (!res.ok) {
        console.error("Failed to send message to customer");
        return;
      }

      const data = await res.json();
      console.log("Message sent to customer:", data);
    } catch (err) {
      console.error("Error sending message to customer:", err);
    }
  };

  return (
    <div className="appointments-container">
      {/* Header */}
      <header className="jade-header">
        <h1>My Appointments</h1>
      </header>

      {/* Upcoming Section */}
      <section>
        <h2 className="section-title">Upcoming</h2>
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
                with {appt.staffName}
              </p>
              <p className="appt-customer">
                Customer: {appt.customerName}
              </p>
            </div>

            <div className="appt-buttons">
              <button
                className="btn-send"
                onClick={() => handleSendMessageClick(appt)}
              >
                Send Message
              </button>
              <button
                className="btn-edit"
                onClick={() => handleEditClick(appt)}
              >
                Edit
              </button>
              <button
                className="btn-cancel"
                onClick={() => handleCancelClick(appt.id)}
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
                with {appt.staffName}
              </p>
              <p className="appt-customer">
                Customer: {appt.customerName}
              </p>
            </div>

            <div className="appt-buttons">
              <button
                className="btn-send"
                onClick={() => handleSendMessageClick(appt)}
              >
                Send Message
              </button>
              <button
                className="btn-edit"
                onClick={() => handleEditClick(appt)}
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Edit Appointment Modal */}
      {showEditModal && selectedAppt && (
        <EditEmpApptModal
          employeeId={employeeId}
          appointment={selectedAppt}
          onClose={() => setShowEditModal(false)}
          onSaved={handleEditSaved}
          onDelete={handleDeleteFromModal}
        />
      )}

      {/* Success Popup */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="success-box">
            <h3>Thank You!</h3>
            <p className="booking-updated">Booking Updated!</p>
            <p>Your appointment has been successfully updated.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAppointments;
