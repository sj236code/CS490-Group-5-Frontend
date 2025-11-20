import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DollarSign, Clock, Calendar, TrendingUp, Info, PieChart } from "lucide-react";
import "../App.css";

const EmployeePaymentPortal = () => {
  const location = useLocation();
  const userFromState = location.state?.user;
  const userIdFromState = location.state?.userId;

  const employeeId = userFromState?.profile_id ?? userIdFromState ?? null;
  const salonId = userFromState?.salon_id ?? null;

  // console.log("Employee id:", employeeId);
  // console.log("Salon id:", salonId);
  // console.log("Location state:", location.state);
  // console.log("EmployeeProfile:", userFromState);
  console.log("userFromState.id:", userFromState?.id);
  console.log("userFromState.profile_id:", userFromState?.profile_id);
  console.log("userIdFromState:", userIdFromState);
  console.log("Final employeeId:", employeeId);

  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [monthlyTotal, setMonthlyTotal] = useState(null);
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
        `${import.meta.env.VITE_API_URL}/api/employee_payroll/${employeeId}/current-period`
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
        `${import.meta.env.VITE_API_URL}/api/employee_payroll/${employeeId}/history`
      );
      
      if (!historyResponse.ok) {
        throw new Error("Failed to fetch payroll history");
      }
      
      const historyData = await historyResponse.json();
      console.log("Payroll history from backend:", historyData);
      setPayrollHistory(historyData.history);

      // Fetch monthly total
      const monthlyResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/employee_payroll/${employeeId}/monthly-total`
      );
      
      if (monthlyResponse.ok) {
        const monthlyData = await monthlyResponse.json();
        console.log("Monthly total from backend:", monthlyData);
        setMonthlyTotal(monthlyData);
      }
      
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

      {/* Commission Structure Reminder */}
      <div className="commission-reminder">
        <Info size={20} />
        <p>
          <strong>MyJade Commission Structure:</strong> You earn 70% of service revenue. 
          The salon retains 30% for operations and overhead.
        </p>
      </div>

      {/* Monthly Total Banner */}
      {monthlyTotal && (
        <section className="monthly-total-banner">
          <div className="monthly-header">
            <PieChart size={24} />
            <h2>{monthlyTotal.month} Total</h2>
          </div>
          <div className="monthly-stats">
            <div className="monthly-stat">
              <p className="monthly-label">Service Revenue</p>
              <p className="monthly-value">${monthlyTotal.total_service_revenue.toFixed(2)}</p>
            </div>
            <div className="monthly-stat highlight">
              <p className="monthly-label">Your Earnings (70%)</p>
              <p className="monthly-value">${monthlyTotal.employee_earnings.toFixed(2)}</p>
            </div>
            <div className="monthly-stat">
              <p className="monthly-label">Salon Share (30%)</p>
              <p className="monthly-value">${monthlyTotal.salon_share.toFixed(2)}</p>
            </div>
            <div className="monthly-stat">
              <p className="monthly-label">Appointments</p>
              <p className="monthly-value">{monthlyTotal.appointments_completed}</p>
            </div>
          </div>
        </section>
      )}

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
                  <p className="stat-label">Service Revenue</p>
                  <p className="stat-value">${currentPeriod.total_service_revenue.toFixed(2)}</p>
                  <p className="stat-subtext">Total from {currentPeriod.appointments_completed} appointments</p>
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
                  <p className="stat-label">Your Earnings (70%)</p>
                  <p className="stat-value projected">
                    ${currentPeriod.projected_paycheck.toFixed(2)}
                  </p>
                  <p className="stat-subtext">Salon: ${currentPeriod.salon_share.toFixed(2)} (30%)</p>
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
            <p className="section-subtitle">Last 6 pay periods (70% commission)</p>

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
                    <div className="history-stat">
                      <DollarSign size={16} />
                      <span>${period.total_service_revenue.toFixed(2)} revenue</span>
                    </div>
                  </div>
                  <div className="history-earnings">
                    <p className="earnings-label">Your Earnings</p>
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

export default EmployeePaymentPortal;