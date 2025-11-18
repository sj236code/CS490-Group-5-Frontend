import React, { useState, useEffect } from "react";
import { MapPin, Calendar, User } from "lucide-react";
import {useLocation} from "react-router-dom";
import EditAppointmentModal from "../components/layout/EditAppointmentModal";
import "../App.css";

const MyAppointments = () => {
  const location = useLocation();
  const userFromState = location.state?.user;
  const customerId = userFromState?.profile_id ?? userIdFromState ?? null;

  console.log("Customer id:", customerId);

  // const customerId = 2; // TODO: replace with real logged-in customer id

  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [previousAppointments, setPreviousAppointments] = useState([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  const handleEditClick = (appt) => {
    setSelectedAppt(appt);
    setShowEditModal(true);
  };

  const handleSave = () => {
    setShowEditModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleCancelClick = (apptId) => {
    setUpcomingAppointments((prev) =>
      prev.filter((appt) => appt.id !== apptId)
    );
  };

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

  // Load upcoming appointments from backend
  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      try {
        const url = `${import.meta.env.VITE_API_URL}/api/appointments/${customerId}/upcoming`;
        const res = await fetch(url);

        if (res.status === 404) {
          console.error("Customer not found");
          setUpcomingAppointments([]);
          return;
        }

        if (!res.ok) {
          console.error("Failed to fetch upcoming appointments");
          setUpcomingAppointments([]);
          return;
        }

        const data = await res.json(); // this should be the list returned by your endpoint

        console.log("Upcoming appointments from backend:", data);

        const mapped = data.map((apt) => ({
          id: apt.id,
          serviceName: apt.service_name || "Service",
          location: apt.salon_name || "Salon",
          dateTime: formatApptDateTime(apt.start_at),
          staffName:
            (apt.employee_first_name || "") +
            (apt.employee_last_name ? ` ${apt.employee_last_name}` : ""),
          // On "My Appointments" page, customer is the logged-in user
          customerName: "You",
        }));

        setUpcomingAppointments(mapped);
      } catch (err) {
        console.error("Error fetching upcoming appointments:", err);
        setUpcomingAppointments([]);
      }
    };

    fetchUpcomingAppointments();
  }, [customerId]);

  // Load previous appointments from backend
  useEffect(() => {
    const fetchPreviousAppointments = async () => {
      try {
        const url = `${import.meta.env.VITE_API_URL}/api/appointments/${customerId}/previous`;
        const res = await fetch(url);

        if (res.status === 404) {
          console.error("Customer not found");
          setPreviousAppointments([]);
          return;
        }

        if (!res.ok) {
          console.error("Failed to fetch previous appointments");
          setPreviousAppointments([]);
          return;
        }

        const data = await res.json();

        console.log("Previous appointments from backend:", data);

        const mapped = data.map((apt) => ({
          id: apt.id,
          serviceName: apt.service_name || "Service",
          location: apt.salon_name || "Salon",
          dateTime: formatApptDateTime(apt.start_at),
          staffName:
            (apt.employee_first_name || "") +
            (apt.employee_last_name ? ` ${apt.employee_last_name}` : ""),
          customerName: "You",
        }));

        setPreviousAppointments(mapped);
      } catch (err) {
        console.error("Error fetching previous appointments:", err);
        setPreviousAppointments([]);
      }
    };

    fetchPreviousAppointments();
  }, [customerId]);

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
              <button className="btn-send">Send Message</button>
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
              <button className="btn-send">Send Message</button>
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

      {/* Edit Modal */}
      {showEditModal && selectedAppt && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">Edit Appointment</h3>

            <label>Service</label>
            <select
              className="service-select"
              defaultValue={selectedAppt.serviceName}
            >
              <option>Classic Fade</option>
              <option>Beard Trim</option>
              <option>Hair Color</option>
            </select>

            <label>Select Experts</label>
            <div className="expert-container">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="expert-card">
                  <img
                    src={`https://i.pravatar.cc/100?img=${n}`}
                    alt="Expert"
                  />
                  <p>Name Last Name</p>
                </div>
              ))}
            </div>

            <label>Date & Time</label>
            <div className="calendar-container">
              {["7:30am", "8:00am", "8:30am", "9:00am", "9:30am", "10:00am"].map(
                (time) => (
                  <button key={time} className="time-btn">
                    {time}
                  </button>
                )
              )}
            </div>

            <div className="modal-buttons">
              <button className="btn-delete">Delete Appt</button>
              <button className="btn-save" onClick={handleSave}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
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

export default MyAppointments;
