// src/components/salon_owner/SalonPaymentsPage.jsx
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

function SalonPaymentsPage() {
  const location = useLocation();
  const userFromState = location.state?.user;
  const salonIdFromState = location.state?.salonId;

  // Owner user should have salon_id on their profile
  const salonId = userFromState?.salon_id ?? salonIdFromState ?? null;

  console.log("Salon Id: ", salonId);

  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [monthlyTotal, setMonthlyTotal] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!salonId) {
      setLoading(false);
      setError("No salon ID found for this owner");
      return;
    }
    fetchSalonPayroll();
  }, [salonId]);

  const fetchSalonPayroll = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Current biweekly period (for whole salon)
      const currentResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/salon_payroll/${salonId}/current-period`
      );

      if (currentResponse.status === 404) {
        setError("Salon not found in payroll system");
        setLoading(false);
        return;
      }

      if (!currentResponse.ok) {
        throw new Error("Failed to fetch current period data");
      }

      const currentData = await currentResponse.json();
      setCurrentPeriod(currentData);

      // 2. History
      const historyResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/salon_payroll/${salonId}/history`
      );

      if (!historyResponse.ok) {
        throw new Error("Failed to fetch payroll history");
      }
      const historyData = await historyResponse.json();
      setPayrollHistory(historyData.history || []);

      // 3. Monthly totals
      const monthlyResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/salon_payroll/${salonId}/monthly-total`
      );

      if (monthlyResponse.ok) {
        const monthlyData = await monthlyResponse.json();
        setMonthlyTotal(monthlyData);
      }

      // 4. Transaction list (existing receipts endpoint)
      const txResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/receipts/salon/${salonId}/transactions`
      );

      if (txResponse.ok) {
        const txData = await txResponse.json();
        setTransactions(txData.transactions || []);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching salon payroll:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-container">
        <header className="jade-header">
          <h1>Salon Payments</h1>
        </header>
        <div className="payment-message payment-message--loading">
          Loading salon payment information...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-container">
        <header className="jade-header">
          <h1>Salon Payments</h1>
        </header>
        <div className="payment-message payment-message--error">
          <p className="payment-error-text">Error: {error}</p>
          <p className="payment-error-id">Salon ID: {salonId || "Not found"}</p>
          <button className="payment-retry-button" onClick={fetchSalonPayroll}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!salonId) {
    return (
      <div className="payment-container">
        <header className="jade-header">
          <h1>Salon Payments</h1>
        </header>
        <div className="payment-message">
          No salon information found. Please log in again as an owner.
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <header className="jade-header">
        <h1>Salon Payments</h1>
      </header>

      {/* Commission Structure Info */}
      <div className="commission-info">
        <Info className="commission-info__icon" size={20} />
        <p className="commission-info__text">
          <strong className="commission-info__title">
            MyJade Commission Structure:
          </strong>{" "}
          Stylists earn 70% of <strong>service</strong> revenue. Your salon
          retains 30% of services and 100% of <strong>product</strong> revenue.
        </p>
      </div>

      {/* Monthly Total for Salon */}
      {monthlyTotal && (
        <section className="monthly-total">
          <div className="monthly-total__header">
            <PieChart className="monthly-total__icon" size={24} />
            <h2 className="monthly-total__title">
              {monthlyTotal.month} Revenue Overview
            </h2>
          </div>
          <p className="monthly-total__note">
            Includes completed and booked appointments for this month, plus
            product sales.
          </p>
          <div className="monthly-total__grid">
            <div className="stat-card">
              <p className="stat-card__label">Service Revenue</p>
              <p className="stat-card__value">
                ${monthlyTotal.total_service_revenue.toFixed(2)}
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-card__label">Product Revenue</p>
              <p className="stat-card__value">
                ${monthlyTotal.total_product_revenue.toFixed(2)}
              </p>
            </div>
            <div className="stat-card stat-card--highlight">
              <p className="stat-card__label">Total Revenue</p>
              <p className="stat-card__value">
                ${monthlyTotal.total_revenue.toFixed(2)}
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-card__label">Salon Earnings (Services + Products)</p>
              <p className="stat-card__value">
                ${monthlyTotal.salon_total_earnings.toFixed(2)}
              </p>
              <p className="stat-card__meta">
                Stylists earned ${monthlyTotal.employee_earnings.toFixed(2)} from
                services
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-card__label">Appointments</p>
              <p className="stat-card__value">
                {monthlyTotal.appointments_completed}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Current Pay Period for Salon */}
      {currentPeriod && (
        <section className="card-section">
          <h2 className="card-section__title">Current Pay Period (Salon)</h2>
          <p className="card-section__subtitle">
            <Calendar size={16} className="card-section__subtitle-icon" />
            {currentPeriod.pay_period.period_label}
          </p>

          <div className="current-period__grid">
            {/* Service Revenue */}
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
                    From {currentPeriod.appointments_completed} appointments
                  </p>
                </div>
              </div>
            </div>

            {/* Product Revenue */}
            <div className="current-period__card">
              <div className="current-period__content">
                <div className="current-period__icon-wrap current-period__icon-wrap--soft">
                  <DollarSign size={24} className="current-period__icon" />
                </div>
                <div>
                  <p className="current-period__label">Product Revenue</p>
                  <p className="current-period__value">
                    ${currentPeriod.total_product_revenue.toFixed(2)}
                  </p>
                  <p className="current-period__meta">
                    From product sales this period
                  </p>
                </div>
              </div>
            </div>

            {/* Salon Earnings */}
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
                    Salon Earnings (Services + Products)
                  </p>
                  <p className="current-period__value">
                    ${currentPeriod.salon_total_earnings.toFixed(2)}
                  </p>
                  <p className="current-period__meta current-period__meta--strong">
                    Services (30%): ${currentPeriod.salon_share_services.toFixed(2)}{" "}
                    · Products (100%): $
                    {currentPeriod.salon_share_products.toFixed(2)}
                  </p>
                  <p className="current-period__meta">
                    Stylists (70% services): $
                    {currentPeriod.employee_earnings.toFixed(2)}
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
      )}

      {/* Salon Pay History */}
      {!!payrollHistory.length && (
        <section className="card-section">
          <h2 className="card-section__title">Salon Pay History</h2>
          <p className="card-section__subtitle card-section__subtitle--muted">
            Last 6 biweekly periods
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
                  <p className="history-item__period">{period.period_label}</p>
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
                      ${period.total_revenue.toFixed(2)} total revenue
                    </span>
                  </div>
                  <div className="history-item__metric">
                    <DollarSign
                      size={16}
                      className="history-item__metric-icon"
                    />
                    <span className="history-item__metric-text">
                      ${period.total_service_revenue.toFixed(2)} services · $
                      {period.total_product_revenue.toFixed(2)} products
                    </span>
                  </div>
                </div>

                <div className="history-item__earnings">
                  <p className="history-item__earnings-label">
                    Salon Earnings
                  </p>
                  <p className="history-item__earnings-value">
                    ${period.salon_total_earnings.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Transactions Table from receipts.py */}
      <section className="card-section">
        <h2 className="card-section__title">Recent Transactions</h2>
        <p className="card-section__subtitle card-section__subtitle--muted">
          From /api/receipts/salon/{salonId}/transactions
        </p>

        <div className="transactions-table-wrapper">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Stylist</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Refund Reason</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.transaction_id || tx.order_id}>
                  <td>
                    {tx.date ? new Date(tx.date).toLocaleString() : "-"}
                  </td>
                  <td>{tx.customer_name}</td>
                  <td>{tx.items && tx.items.length ? tx.items.join(", ") : "-"}</td>
                  <td>{tx.stylist}</td>
                  <td>${tx.amount.toFixed(2)}</td>
                  {/* payment_method will be "N/A" for now */}
                  <td>{tx.payment_method || "N/A"}</td>
                  <td>{tx.status}</td>
                  <td>{tx.refund_reason || "-"}</td>
                </tr>
              ))}

              {transactions.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center" }}>
                    No transactions found for this salon yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default SalonPaymentsPage;