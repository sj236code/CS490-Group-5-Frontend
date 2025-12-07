import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import "../../App.css";

function SalonActivityPage() {
  const API = import.meta.env.VITE_API_URL;

  const [pending, setPending] = useState([]);
  const [topSalons, setTopSalons] = useState([]);
  const [trends, setTrends] = useState([]);
  const [avgTime, setAvgTime] = useState(0);
  const [customerTrend, setCustomerTrend] = useState([]);
  const [salonTrend, setSalonTrend] = useState([]);

  // NEW: peak-hour data
  const [peakByHour, setPeakByHour] = useState([]);
  const [peakByDowHour, setPeakByDowHour] = useState([]);
  const [dowHeatmapData, setDowHeatmapData] = useState([]);

  // Toast popup
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type });
    }, 2500); // disappears after 2.5 sec
  };

  /* ---------------------------------------------
        TRANSFORM PEAK BY DOW + HOUR → STACKED DATA
  --------------------------------------------- */
  useEffect(() => {
    if (!peakByDowHour || peakByDowHour.length === 0) {
      setDowHeatmapData([]);
      return;
    }

    const DOW_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const byHour = {};

    peakByDowHour.forEach(({ dow, hour, count }) => {
      if (!byHour[hour]) {
        byHour[hour] = { hour };
        DOW_ORDER.forEach((d) => {
          byHour[hour][d] = 0;
        });
      }
      byHour[hour][dow] = count;
    });

    const rows = Object.values(byHour).sort((a, b) => a.hour - b.hour);
    setDowHeatmapData(rows);
  }, [peakByDowHour]);

  /* ---------------------------------------------
        LOAD ALL DASHBOARD DATA
  --------------------------------------------- */
  const loadData = async () => {
    try {
      const [p, t, tr, m, ct, st, ph] = await Promise.all([
        fetch(`${API}/api/admin/salon-activity/pending`),
        fetch(`${API}/api/admin/salon-activity/top`),
        fetch(`${API}/api/admin/salon-activity/trends`),
        fetch(`${API}/api/admin/salon-activity/metrics`),
        fetch(`${API}/api/admin/salon-activity/customers-trend`),
        fetch(`${API}/api/admin/salon-activity/salons-trend`),
        fetch(`${API}/api/admin/salon-activity/peak-hours`),
      ]);

      const [pj, tj, trj, mj, ctj, stj, phj] = await Promise.all([
        p.json(),
        t.json(),
        tr.json(),
        m.json(),
        ct.json(),
        st.json(),
        ph.json(),
      ]);

      setPending(pj.pending || []);
      setTopSalons(tj.top_salons || []);
      setTrends(trj.trends || []);
      setAvgTime(mj.avg_time || 0);
      setCustomerTrend(ctj.customers || []);
      setSalonTrend(stj.salons || []);

      // NEW: peak-hour data
      setPeakByHour(phj.byHour || []);
      setPeakByDowHour(phj.byDowHour || []);
    } catch (err) {
      console.error("Failed to load salon activity:", err);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------------------------------------
        APPROVE / REJECT
  --------------------------------------------- */
  const updateVerification = async (verificationId, status) => {
    try {
      const res = await fetch(
        `${API}/api/admin/verification/${verificationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) throw new Error("Failed to update");

      if (status === "APPROVED") {
        showToast("Registration approved ✔️", "success");
      } else {
        showToast("Registration rejected ❌", "error");
      }

      loadData(); // refresh UI
    } catch (err) {
      showToast("Update failed. Try again.", "error");
      console.error(err);
    }
  };

  return (
    <div className="admin-wrapper">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`sa-toast ${toast.type}`}>{toast.message}</div>
      )}

      {/* ====================== PAGE HEADER ====================== */}
      <div className="sa-section-header">
        <h2 className="sa-main-title">Salon Performance</h2>
      </div>

      {/* ====================== TOP SUMMARY ROW ====================== */}
      <div className="sa-top-row">
        {/* ---------- PENDING VERIFICATIONS ---------- */}
        <div className="sa-box sa-left">
          <h3 className="sa-box-title">Pending Verifications</h3>

          {pending.length === 0 ? (
            <p className="sa-empty">No salons awaiting verification.</p>
          ) : (
            <ol className="sa-list">
              {pending.map((item, index) => (
                <li key={item.verification_id} className="sa-row">
                  <span>
                    {index + 1}. {item.name}
                  </span>

                  <div className="sa-buttons">
                    <button
                      className="sa-green-btn"
                      onClick={() =>
                        updateVerification(item.verification_id, "APPROVED")
                      }
                    >
                      ✔
                    </button>

                    <button
                      className="sa-red-btn"
                      onClick={() =>
                        updateVerification(item.verification_id, "REJECTED")
                      }
                    >
                      ✖
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* ---------- TOP SALONS ---------- */}
        <div className="sa-box sa-center">
          <h3 className="sa-box-title">Top Salons</h3>

          {topSalons.length === 0 ? (
            <p className="sa-empty">No salon ranking data.</p>
          ) : (
            <ol className="sa-list">
              {topSalons.map((s, index) => (
                <li key={index} className="sa-top-row-fixed">
                  <span className="sa-rank">{index + 1}.</span>
                  <span className="sa-name">{s.name}</span>
                  <span className="sa-bookings">{s.count} bookings</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* ---------- AVG TIME ---------- */}
        <div className="sa-box sa-right">
          <h3 className="sa-box-title">Avg. Appointment Time</h3>

          <p className="sa-time-value">
            {avgTime === 0 ? "—" : `${avgTime} min`}
          </p>
        </div>
      </div>

      {/* ====================== MAIN APPOINTMENT TRENDS ====================== */}
      <div className="sa-box sa-full">
        <h3 className="sa-box-title">Appointment Trends (Last 7 Days)</h3>

        <div className="sa-chart-area">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#556B2F"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ====================== BOOKINGS BY HOUR (PEAK HOURS) ====================== */}
      <div className="sa-box sa-full">
        <h3 className="sa-box-title">Bookings by Hour (Last 30 Days)</h3>

        <div className="sa-chart-area">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={peakByHour}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="hour"
                tickFormatter={(h) => `${h}:00`}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value) => [`${value} bookings`, "Bookings"]}
                labelFormatter={(h) => `Hour: ${h}:00`}
              />
              <Bar dataKey="count" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ====================== PEAK HOURS BY DAY OF WEEK ====================== */}
      <div className="sa-box sa-full">
        <h3 className="sa-box-title">Peak Hours by Day of Week</h3>

        <div className="sa-chart-area">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dowHeatmapData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="hour"
                tickFormatter={(h) => `${h}:00`}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              {/* Stacked bars: each day segment is a different stack */}
              <Bar dataKey="Mon" stackId="a" />
              <Bar dataKey="Tue" stackId="a" />
              <Bar dataKey="Wed" stackId="a" />
              <Bar dataKey="Thu" stackId="a" />
              <Bar dataKey="Fri" stackId="a" />
              <Bar dataKey="Sat" stackId="a" />
              <Bar dataKey="Sun" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ====================== NEW CUSTOMER TREND ====================== */}
      <div className="sa-box sa-full">
        <h3 className="sa-box-title">New Customer Registrations (Last 7 Days)</h3>

        <div className="sa-chart-area">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={customerTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#4B5945"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ====================== NEW SALON TREND ====================== */}
      <div className="sa-box sa-full">
        <h3 className="sa-box-title">New Salon Registrations (Last 30 Days)</h3>

        <div className="sa-chart-area">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={salonTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#7E8E6F"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default SalonActivityPage;
