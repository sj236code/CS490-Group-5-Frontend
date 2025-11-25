// src/components/salon_dashboard/DashboardMetricsTab.jsx
import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Calendar,
  TrendingUp,
  Info,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function DashboardMetricsTab({ salon, user }) {
  // Match Calendar tab pattern
  const salonId = salon?.id ?? user?.salon_id ?? null;

  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [monthlyTotal, setMonthlyTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!salonId) {
      setLoading(false);
      setError("No salon ID found for this owner");
      return;
    }
    fetchSalonMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId]);

  const fetchSalonMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const base = import.meta.env.VITE_API_URL;

      // 1. Current biweekly period (for whole salon)
      const currentResponse = await fetch(
        `${base}/api/salon_payroll/${salonId}/current-period`
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

      // 2. Monthly totals
      const monthlyResponse = await fetch(
        `${base}/api/salon_payroll/${salonId}/monthly-total`
      );

      if (monthlyResponse.ok) {
        const monthlyData = await monthlyResponse.json();
        setMonthlyTotal(monthlyData);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching salon metrics:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="metrics-tab payment-container">
        <div className="payment-message payment-message--loading">
          Loading salon metrics…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="metrics-tab payment-container">
        <div className="payment-message payment-message--error">
          <p className="payment-error-text">Error: {error}</p>
          <p className="payment-error-id">Salon ID: {salonId || "Not found"}</p>
          <button className="payment-retry-button" onClick={fetchSalonMetrics}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!salonId) {
    return (
      <div className="metrics-tab payment-container">
        <div className="payment-message">
          No salon information found. Please log in again as an owner.
        </div>
      </div>
    );
  }

  // --- Chart data (from existing endpoints) ---
  const revenueSplitData =
    monthlyTotal && monthlyTotal.total_service_revenue != null
      ? [
          {
            name: "Service Revenue",
            value: monthlyTotal.total_service_revenue,
          },
          {
            name: "Product Revenue",
            value: monthlyTotal.total_product_revenue,
          },
        ]
      : [];

  const REVENUE_COLORS = ["#4B5945", "#96A78D"]; // dark + light jade

  return (
    <div className="metrics-tab payment-container">
      {/* Dashboard header */}
      <header className="jade-header" style={{ marginBottom: "1rem" }}>
        <div>
          <h2>Salon Metrics Dashboard</h2>
          <p className="jade-header-subtitle">
            Quick overview of revenue, earnings, and appointments for your
            salon.
          </p>
        </div>
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

      {/* TOP KPI ROW – full width */}
      {monthlyTotal && (
        <section style={{ marginTop: "1.25rem" }}>
          <div className="calendar-stats-row">
            <div className="calendar-stat-card">
              <div className="calendar-stat-label">
                Total Revenue (This Month)
              </div>
              <div className="calendar-stat-value">
                ${monthlyTotal.total_revenue.toFixed(2)}
              </div>
            </div>
            <div className="calendar-stat-card">
              <div className="calendar-stat-label">Salon Earnings</div>
              <div className="calendar-stat-value">
                ${monthlyTotal.salon_total_earnings.toFixed(2)}
              </div>
            </div>
            <div className="calendar-stat-card">
              <div className="calendar-stat-label">
                Stylist Earnings (Services)
              </div>
              <div className="calendar-stat-value">
                ${monthlyTotal.employee_earnings.toFixed(2)}
              </div>
            </div>
            <div className="calendar-stat-card">
              <div className="calendar-stat-label">
                Appointments (This Month)
              </div>
              <div className="calendar-stat-value">
                {monthlyTotal.appointments_completed}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* MAIN GRID: left = breakdown card, right = chart card */}
      <section
        className="metrics-main-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.5fr",
          gap: "16px",
          marginTop: "16px",
        }}
      >
        {/* LEFT: Monthly Revenue Breakdown */}
        {monthlyTotal && (
          <div className="card-section">
            <div
              className="monthly-total__header"
              style={{ marginBottom: "0.5rem" }}
            >
              <PieChartIcon className="monthly-total__icon" size={24} />
              <h3 className="monthly-total__title">
                {monthlyTotal.month} Revenue Breakdown
              </h3>
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
                <p className="stat-card__label">
                  Salon Earnings (Services + Products)
                </p>
                <p className="stat-card__value">
                  ${monthlyTotal.salon_total_earnings.toFixed(2)}
                </p>
                <p className="stat-card__meta">
                  Stylists earned $
                  {monthlyTotal.employee_earnings.toFixed(2)} from services
                </p>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT: Pie chart – Service vs Product */}
        {monthlyTotal && revenueSplitData.length > 0 && (
          <div className="card-section">
            <h3 className="card-section__title">Service vs Product Revenue</h3>
            <p className="card-section__subtitle card-section__subtitle--muted">
              Visual split of this month&apos;s revenue.
            </p>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <RePieChart>
                  <Pie
                    data={revenueSplitData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={3}
                  >
                    {revenueSplitData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={REVENUE_COLORS[index % REVENUE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `$${Number(value).toFixed(2)}`}
                  />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>

      {/* BOTTOM: Current Pay Period Snapshot – full width card */}
      {currentPeriod && (
        <section className="card-section" style={{ marginTop: "16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div>
              <h3 className="card-section__title">Current Pay Period (Salon)</h3>
              <p className="card-section__subtitle">
                <Calendar size={16} className="card-section__subtitle-icon" />
                {currentPeriod.pay_period.period_label}
              </p>
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
          </div>

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
                    Services (30%): $
                    {currentPeriod.salon_share_services.toFixed(2)} · Products
                    (100%): ${currentPeriod.salon_share_products.toFixed(2)}
                  </p>
                  <p className="current-period__meta">
                    Stylists (70% services): $
                    {currentPeriod.employee_earnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default DashboardMetricsTab;
