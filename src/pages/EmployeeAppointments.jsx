import React, { useState } from "react";
import { MapPin, Calendar, User } from "lucide-react";
import "../App.css";

const EmployeeAppointments = () => {
  // Hardcoded for now, but easily replaceable with fetched data

  const location = useLocation();
  const userFromState = location.state?.user;
  const employeeId = userFromState?.profile_id ?? userIdFromState ?? null;

  console.log("Employee id:", employeeId);

  const [upcomingAppointments, setUpcomingAppointments] = useState([
    {
      id: 1,
      serviceName: "Classic Fade",
      location: "JADE Boutique",
      dateTime: "Monday, October 20 at 10:00 AM",
      staffName: "Markus",
      customerName: "John Smith",
    },
    {
      id: 2,
      serviceName: "Hot Towel Shave",
      location: "JADE Boutique",
      dateTime: "Saturday, October 25 at 8:00 AM",
      staffName: "John Doe",
      customerName: "Mike Scott",
    },
  ]);

  const [previousAppointments] = useState([
    {
      id: 3,
      serviceName: "Hot Towel Shave",
      location: "JADE Boutique",
      dateTime: "Saturday, October 5 at 8:00 AM",
      staffName: "John Doe",
      customerName: "Mike Scott",
    },
  ]);

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

export default EmployeeAppointments;
