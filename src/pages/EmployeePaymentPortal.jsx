import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DollarSign, Clock, Calendar, TrendingUp, Info, PieChart } from "lucide-react";
import "../App.css";

function EmployeePaymentPortal() {
  const location = useLocation();
  const userFromState = location.state?.user;
  const userIdFromState = location.state?.userId;

  const employeeId = userFromState?.profile_id ?? userIdFromState ?? null;
  const salonId = userFromState?.salon_id ?? null;

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
        <div style={{ padding: "20px", textAlign: "center", color: "#5a6d57" }}>
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
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p style={{ color: "#8b4513", marginBottom: "10px" }}>Error: {error}</p>
          <p style={{ color: "#5a6d57" }}>Employee ID: {employeeId || "Not found"}</p>
          <button 
            onClick={fetchPayrollData}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              backgroundColor: "#5a6d57",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
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
        <div style={{ padding: "20px", textAlign: "center", color: "#5a6d57" }}>
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
      <div style={{
        backgroundColor: "#f5f0e8",
        border: "1px solid #d4c5a9",
        borderRadius: "8px",
        padding: "16px",
        margin: "20px",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}>
        <Info size={20} style={{ color: "#8b7355", flexShrink: 0 }} />
        <p style={{ margin: 0, color: "#5a6d57", fontSize: "14px" }}>
          <strong style={{ color: "#3d4f3a" }}>MyJade Commission Structure:</strong> You earn 70% of service revenue. 
          The salon retains 30% for operations and overhead.
        </p>
      </div>

      {/* Monthly Total */}
      {monthlyTotal && (
        <section style={{
          backgroundColor: "#e8f0e3",
          border: "1px solid #c5d9ba",
          borderRadius: "8px",
          padding: "20px",
          margin: "20px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <PieChart size={24} style={{ color: "#5a6d57" }} />
            <h2 style={{ margin: 0, color: "#3d4f3a", fontSize: "20px" }}>
              {monthlyTotal.month} Projected Total
            </h2>
          </div>
          <p style={{ 
            fontSize: "13px", 
            color: "#7a6f5d", 
            marginBottom: "16px",
            fontStyle: "italic"
          }}>
            Note: This includes future scheduled appointments. Actual earnings may vary based on completed appointments.
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px"
          }}>
            <div style={{ textAlign: "center", padding: "12px", backgroundColor: "white", borderRadius: "6px" }}>
              <p style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#7a6f5d" }}>Service Revenue</p>
              <p style={{ margin: 0, fontSize: "24px", color: "#3d4f3a" }}>
                ${monthlyTotal.total_service_revenue.toFixed(2)}
              </p>
            </div>
            <div style={{ 
              textAlign: "center", 
              padding: "12px", 
              backgroundColor: "#f8fdf5", 
              borderRadius: "6px",
              border: "2px solid #c5d9ba"
            }}>
              <p style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#5a6d57" }}>Your Projected Earnings (70%)</p>
              <p style={{ margin: 0, fontSize: "24px", color: "#3d4f3a" }}>
                ${monthlyTotal.employee_earnings.toFixed(2)}
              </p>
            </div>
            <div style={{ textAlign: "center", padding: "12px", backgroundColor: "white", borderRadius: "6px" }}>
              <p style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#7a6f5d" }}>Salon Share (30%)</p>
              <p style={{ margin: 0, fontSize: "24px", color: "#3d4f3a" }}>
                ${monthlyTotal.salon_share.toFixed(2)}
              </p>
            </div>
            <div style={{ textAlign: "center", padding: "12px", backgroundColor: "white", borderRadius: "6px" }}>
              <p style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#7a6f5d" }}>Appointments</p>
              <p style={{ margin: 0, fontSize: "24px", color: "#3d4f3a" }}>
                {monthlyTotal.appointments_completed}
              </p>
            </div>
          </div>
        </section>
      )}

      {currentPeriod && (
        <>
          {/* Current Pay Period */}
          <section style={{ margin: "20px", padding: "20px", backgroundColor: "white", borderRadius: "8px", border: "1px solid #e5e5e5" }}>
            <h2 style={{ color: "#3d4f3a", marginBottom: "8px" }}>Current Pay Period</h2>
            <p style={{ display: "flex", alignItems: "center", color: "#7a6f5d", fontSize: "14px", marginBottom: "20px" }}>
              <Calendar size={16} style={{ marginRight: "6px" }} />
              {currentPeriod.pay_period.period_label}
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px"
            }}>
              <div style={{
                padding: "16px",
                backgroundColor: "#fafafa",
                borderRadius: "8px",
                border: "1px solid #e5e5e5"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div style={{
                    backgroundColor: "#e8f0e3",
                    borderRadius: "50%",
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <DollarSign size={24} style={{ color: "#5a6d57" }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#7a6f5d" }}>Service Revenue</p>
                    <p style={{ margin: "4px 0 0 0", fontSize: "26px", color: "#3d4f3a" }}>
                      ${currentPeriod.total_service_revenue.toFixed(2)}
                    </p>
                    <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#999" }}>
                      Total from {currentPeriod.appointments_completed} appointments
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                padding: "16px",
                backgroundColor: "#fafafa",
                borderRadius: "8px",
                border: "1px solid #e5e5e5"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div style={{
                    backgroundColor: "#e8f0e3",
                    borderRadius: "50%",
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Clock size={24} style={{ color: "#5a6d57" }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#7a6f5d" }}>Hours Worked</p>
                    <p style={{ margin: "4px 0 0 0", fontSize: "26px", color: "#3d4f3a" }}>
                      {currentPeriod.hours_worked.toFixed(2)} hrs
                    </p>
                    <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#999" }}>
                      {currentPeriod.appointments_completed} appointments completed
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                padding: "16px",
                backgroundColor: "#f8fdf5",
                borderRadius: "8px",
                border: "2px solid #c5d9ba"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div style={{
                    backgroundColor: "#5a6d57",
                    borderRadius: "50%",
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <TrendingUp size={24} style={{ color: "white" }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#5a6d57" }}>Your Earnings (70%)</p>
                    <p style={{ margin: "4px 0 0 0", fontSize: "26px", color: "#3d4f3a" }}>
                      ${currentPeriod.projected_paycheck.toFixed(2)}
                    </p>
                    <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#7a6f5d" }}>
                      Salon: ${currentPeriod.salon_share.toFixed(2)} (30%)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ 
              marginTop: "20px", 
              padding: "12px", 
              backgroundColor: "#f5f0e8", 
              borderRadius: "6px",
              borderLeft: "4px solid #8b7355"
            }}>
              <p style={{ margin: 0, fontSize: "14px", color: "#5a6d57" }}>
                <strong style={{ color: "#3d4f3a" }}>Pay Period:</strong> {currentPeriod.pay_period.start_date} to{" "}
                {currentPeriod.pay_period.end_date}
              </p>
            </div>
          </section>

          {/* Payment History */}
          <section style={{ margin: "20px", padding: "20px", backgroundColor: "white", borderRadius: "8px", border: "1px solid #e5e5e5" }}>
            <h2 style={{ color: "#3d4f3a", marginBottom: "4px" }}>Payment History</h2>
            <p style={{ color: "#7a6f5d", fontSize: "14px", marginBottom: "20px" }}>
              Last 6 pay periods (70% commission)
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {payrollHistory.map((period, index) => (
                <div 
                  key={index} 
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr 1fr",
                    gap: "16px",
                    padding: "16px",
                    backgroundColor: index === 0 ? "#f8fdf5" : "#fafafa",
                    borderRadius: "8px",
                    border: index === 0 ? "1px solid #c5d9ba" : "1px solid #e5e5e5",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: "15px", color: "#3d4f3a" }}>
                      {period.period_label}
                    </p>
                    <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#999" }}>
                      {period.period_start} to {period.period_end}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Clock size={16} style={{ color: "#7a6f5d" }} />
                      <span style={{ fontSize: "14px", color: "#5a6d57" }}>
                        {period.hours_worked.toFixed(2)} hrs
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Calendar size={16} style={{ color: "#7a6f5d" }} />
                      <span style={{ fontSize: "14px", color: "#5a6d57" }}>
                        {period.appointments_completed} appts
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <DollarSign size={16} style={{ color: "#7a6f5d" }} />
                      <span style={{ fontSize: "14px", color: "#5a6d57" }}>
                        ${period.total_service_revenue.toFixed(2)} revenue
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: "12px", color: "#7a6f5d" }}>Your Earnings</p>
                    <p style={{ margin: "4px 0 0 0", fontSize: "22px", color: "#3d4f3a" }}>
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