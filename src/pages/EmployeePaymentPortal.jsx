import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  DollarSign,
  Clock,
  Calendar,
  TrendingUp,
  Info,
  PieChart,
} from "lucide-react";

function EmployeePaymentPortal() {
  const location = useLocation();
  const userFromState = location.state?.user;
  const userIdFromState = location.state?.userId;

  const employeeId = userFromState?.profile_id ?? userIdFromState ?? null;
  const salonId = userFromState?.salon_id ?? null; // currently unused but kept in case you need it later

  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [monthlyTotal, setMonthlyTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employeeId) {
      setLoading(false);
      setError("No employee ID found in location state");
      return;
    }
    fetchPayrollData();
  }, [employeeId]);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/employee_payroll/${employeeId}/current-period`
      );

      if (currentResponse.status === 404) {
        setError("Employee not found in payroll system");
        setLoading(false);
        return;
      }

      if (!currentResponse.ok) {
        throw new Error("Failed to fetch current period data");
      }

      const currentData = await currentResponse.json();
      setCurrentPeriod(currentData);

      const historyResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/employee_payroll/${employeeId}/history`
      );

      if (!historyResponse.ok) {
        throw new Error("Failed to fetch payroll history");
      }

      const historyData = await historyResponse.json();
      setPayrollHistory(historyData.history);

      const monthlyResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/employee_payroll/${employeeId}/monthly-total`
      );

      if (monthlyResponse.ok) {
        const monthlyData = await monthlyResponse.json();
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
        <div className="payment-message payment-message--loading">
          Loading payment information...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-container">
        <header className="jade-header">
          <h1>Payment Portal</h1>
        </header>
        <div className="payment-message payment-message--error">
          <p className="payment-error-text">Error: {error}</p>
          <p className="payment-error-id">
            Employee ID: {employeeId || "Not found"}
          </p>
          <button className="payment-retry-button" onClick={fetchPayrollData}>
            Retry
          </button>
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
        <div className="payment-message">
          No employee information found. Please log in again.
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <header className="jade-header">
        <h1>Payment Portal</h1>
      </header>

      {/* Commission Structure Info */}
      <div className="commission-info">
        <Info className="commission-info__icon" size={20} />
        <p className="commission-info__text">
          <strong className="commission-info__title">
            MyJade Commission Structure:
          </strong>{" "}
          You earn 70% of service revenue. The salon retains 30% for operations
          and overhead.
        </p>
      </div>

      {/* Monthly Total */}
      {monthlyTotal && (
        <section className="monthly-total">
          <div className="monthly-total__header">
            <PieChart className="monthly-total__icon" size={24} />
            <h2 className="monthly-total__title">
              {monthlyTotal.month} Projected Total
            </h2>
          </div>
          <p className="monthly-total__note">
            Note: This includes future scheduled appointments. Actual earnings
            may vary based on completed appointments.
          </p>
          <div className="monthly-total__grid">
            <div className="stat-card">
              <p className="stat-card__label">Service Revenue</p>
              <p className="stat-card__value">
                ${monthlyTotal.total_service_revenue.toFixed(2)}
              </p>
            </div>
            <div className="stat-card stat-card--highlight">
              <p className="stat-card__label">
                Your Projected Earnings (70%)
              </p>
              <p className="stat-card__value">
                ${monthlyTotal.employee_earnings.toFixed(2)}
              </p>
            </div>
            {/* <div className="stat-card">
              <p className="stat-card__label">Salon Share (30%)</p>
              <p className="stat-card__value">
                ${monthlyTotal.salon_share.toFixed(2)}
              </p>
            </div> */}
            <div className="stat-card">
              <p className="stat-card__label">Appointments</p>
              <p className="stat-card__value">
                {monthlyTotal.appointments_completed}
              </p>
            </div>
          </div>
        </section>
      )}

      {currentPeriod && (
        <>
          {/* Current Pay Period */}
          <section className="card-section">
            <h2 className="card-section__title">Current Pay Period</h2>
            <p className="card-section__subtitle">
              <Calendar size={16} className="card-section__subtitle-icon" />
              {currentPeriod.pay_period.period_label}
            </p>

            <div className="current-period__grid">
              <div className="current-period__card">
                <div className="current-period__content">
                  <div className="current-period__icon-wrap current-period__icon-wrap--soft">
                    <DollarSign size={24} className="current-period__icon" />
                  </div>
                  <div>
                    <p className="current-period__label">Service Revenue</p>
                    <p className="current-period__value">
                      ${currentPeriod.total_service_revenue.toFixed(2)}
                    </p>
                    <p className="current-period__meta">
                      Total from {currentPeriod.appointments_completed}{" "}
                      appointments
                    </p>
                  </div>
                </div>
              </div>

              <div className="current-period__card">
                <div className="current-period__content">
                  <div className="current-period__icon-wrap current-period__icon-wrap--soft">
                    <Clock size={24} className="current-period__icon" />
                  </div>
                  <div>
                    <p className="current-period__label">Hours Worked</p>
                    <p className="current-period__value">
                      {currentPeriod.hours_worked.toFixed(2)} hrs
                    </p>
                    <p className="current-period__meta">
                      {currentPeriod.appointments_completed} appointments
                      completed
                    </p>
                  </div>
                </div>
              </div>

              <div className="current-period__card current-period__card--highlight">
                <div className="current-period__content">
                  <div className="current-period__icon-wrap current-period__icon-wrap--solid">
                    <TrendingUp
                      size={24}
                      className="current-period__icon current-period__icon--inverse"
                    />
                  </div>
                  <div>
                    <p className="current-period__label current-period__label--strong">
                      Your Earnings (70%)
                    </p>
                    <p className="current-period__value">
                      ${currentPeriod.projected_paycheck.toFixed(2)}
                    </p>
                    <p className="current-period__meta current-period__meta--strong">
                      Salon: ${currentPeriod.salon_share.toFixed(2)} (30%)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="current-period__banner">
              <p className="current-period__banner-text">
                <strong className="current-period__banner-label">
                  Pay Period:
                </strong>{" "}
                {currentPeriod.pay_period.start_date} to{" "}
                {currentPeriod.pay_period.end_date}
              </p>
            </div>
          </section>

          {/* Payment History */}
          <section className="card-section">
            <h2 className="card-section__title">Payment History</h2>
            <p className="card-section__subtitle card-section__subtitle--muted">
              Last 6 pay periods (70% commission)
            </p>

            <div className="history-list">
              {payrollHistory.map((period, index) => (
                <div
                  key={index}
                  className={`history-item ${
                    index === 0 ? "history-item--recent" : ""
                  }`}
                >
                  <div>
                    <p className="history-item__period">
                      {period.period_label}
                    </p>
                    <p className="history-item__dates">
                      {period.period_start} to {period.period_end}
                    </p>
                  </div>

                  <div className="history-item__metrics">
                    <div className="history-item__metric">
                      <Clock size={16} className="history-item__metric-icon" />
                      <span className="history-item__metric-text">
                        {period.hours_worked.toFixed(2)} hrs
                      </span>
                    </div>
                    <div className="history-item__metric">
                      <Calendar
                        size={16}
                        className="history-item__metric-icon"
                      />
                      <span className="history-item__metric-text">
                        {period.appointments_completed} appts
                      </span>
                    </div>
                    <div className="history-item__metric">
                      <DollarSign
                        size={16}
                        className="history-item__metric-icon"
                      />
                      <span className="history-item__metric-text">
                        ${period.total_service_revenue.toFixed(2)} revenue
                      </span>
                    </div>
                  </div>

                  <div className="history-item__earnings">
                    <p className="history-item__earnings-label">
                      Your Earnings
                    </p>
                    <p className="history-item__earnings-value">
                      ${period.earnings.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default EmployeePaymentPortal;
