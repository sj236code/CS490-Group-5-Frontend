import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { DollarSign, Clock, Calendar, TrendingUp } from "lucide-react";
import "../App.css";

const EmployeePayment = () => {
  const location = useLocation();
  const userFromState = location.state?.user;
  const userIdFromState = location.state?.userId;

  const employeeId = userFromState?.profile_id ?? userIdFromState ?? null;

  console.log("Employee id:", employeeId);
  console.log("Location state:", location.state);

  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employeeId) return;
    fetchPayrollData();
  }, [employeeId]);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      
      // Fetch current period data
      const currentResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payroll/${employeeId}/current-period`
      );
      
      if (currentResponse.status === 404) {
        console.error("Employee not found");
        setLoading(false);
        return;
      }
      
      if (!currentResponse.ok) {
        throw new Error("Failed to fetch current period data");
      }
      
      const currentData = await currentResponse.json();
      console.log("Current period data from backend:", currentData);
      setCurrentPeriod(currentData);

      // Fetch payroll history
      const historyResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payroll/${employeeId}/history`
      );
      
      if (!historyResponse.ok) {
        throw new Error("Failed to fetch payroll history");
      }
      
      const historyData = await historyResponse.json();
      console.log("Payroll history from backend:", historyData);
      setPayrollHistory(historyData.history);
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching payroll data:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-container">
        <header className="jade-header">
          <h1>Payment Portal</h1>
        </header>
        <div style={{ padding: "20px", textAlign: "center" }}>
          Loading payment information...
        </div>
      </div>
    );
  }

  if (!employeeId) {
    return (
      <div className="payment-container">
        <header className="jade-header">
          <h1>Payment Portal</h1>
        </header>
        <div style={{ padding: "20px", textAlign: "center" }}>
          No employee information found.
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <header className="jade-header">
        <h1>Payment Portal</h1>
      </header>

      <div className="tab-bar">
        <Link to="/employee-overview">
          <button>Overview</button>
        </Link>
        <Link to="/employee-schedule">
          <button>Schedule</button>
        </Link>
        <Link to="/employee-availability">
          <button>Availability</button>
        </Link>
        <Link to="/employee-payment-portal">
          <button className="active-tab">Payment</button>
        </Link>
      </div>

      {currentPeriod && (
        <>
          {/* Current Pay Period Summary */}
          <section className="payment-summary">
            <h2>Current Pay Period</h2>
            <p className="period-dates">
              <Calendar size={16} style={{ marginRight: "6px" }} />
              {currentPeriod.pay_period.period_label}
            </p>

            <div className="payment-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <DollarSign size={24} />
                </div>
                <div className="stat-info">
                  <p className="stat-label">Hourly Wage</p>
                  <p className="stat-value">${currentPeriod.hourly_wage.toFixed(2)}/hr</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Clock size={24} />
                </div>
                <div className="stat-info">
                  <p className="stat-label">Hours Worked</p>
                  <p className="stat-value">{currentPeriod.hours_worked.toFixed(2)} hrs</p>
                  <p className="stat-subtext">
                    {currentPeriod.appointments_completed} appointments completed
                  </p>
                </div>
              </div>

              <div className="stat-card highlight">
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-info">
                  <p className="stat-label">Projected Paycheck</p>
                  <p className="stat-value projected">
                    ${currentPeriod.projected_paycheck.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="period-info">
              <p>
                <strong>Pay Period:</strong> {currentPeriod.pay_period.start_date} to{" "}
                {currentPeriod.pay_period.end_date}
              </p>
            </div>
          </section>

          {/* Payment History */}
          <section className="payment-history">
            <h2>Payment History</h2>
            <p className="section-subtitle">Last 6 pay periods</p>

            <div className="history-list">
              {payrollHistory.map((period, index) => (
                <div key={index} className="history-card">
                  <div className="history-period">
                    <p className="history-dates">{period.period_label}</p>
                    <p className="history-dates-detail">
                      {period.period_start} to {period.period_end}
                    </p>
                  </div>
                  <div className="history-details">
                    <div className="history-stat">
                      <Clock size={16} />
                      <span>{period.hours_worked.toFixed(2)} hrs</span>
                    </div>
                    <div className="history-stat">
                      <Calendar size={16} />
                      <span>{period.appointments_completed} appointments</span>
                    </div>
                  </div>
                  <div className="history-earnings">
                    <p className="earnings-label">Earnings</p>
                    <p className="earnings-value">${period.earnings.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default EmployeePayment;