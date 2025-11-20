import { useEffect, useState } from "react";
import { Download, Search, Calendar as CalendarIcon } from "lucide-react";

function SalonPaymentsPage() {
  // For now this is hard-coded
  const salonId = 1;

  const [transactions, setTransactions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("date_desc");

  // Load all transactions for this salon
  useEffect(() => {
    if (!salonId) return;

    const fetchTransactions = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/receipts/salon/${salonId}/transactions`);
        const data = await res.json();

        if (res.ok && data.status === "success") {
          setTransactions(data.transactions || []);
        } 
        else {
          console.error("Failed to load transactions:", data);
        }
      } 
      catch (err) {
        console.error("Error loading transactions:", err);
      }
    };

    fetchTransactions();
  }, [salonId]);

  // --- Helpers ---

  const formatCurrency = (value) => {
    return `$${(value || 0).toFixed(2)}`;
  };

  const formatDateTime = (iso) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString(),
      time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  // Build summary numbers for the cards
  const getSummary = () => {
    if (!transactions.length) {
      return {
        totalRevenue: 0,
        completedCount: 0,
        completedAvg: 0,
        pendingCount: 0,
        failedOrRefundedCount: 0,
        refundedAmount: 0,
      };
    }

    let totalRevenue = 0;
    let completedCount = 0;
    let pendingCount = 0;
    let failedOrRefundedCount = 0;
    let refundedAmount = 0;

    for (const t of transactions) {
      const status = (t.status || "").toLowerCase();

      if (status === "completed" || status === "successful") {
        totalRevenue += t.amount || 0;
        completedCount += 1;
      } 
      else if (status === "pending") {
        pendingCount += 1;
      } 
      else if (status === "failed" || status === "refunded") {
        failedOrRefundedCount += 1;
        if (status === "refunded") {
          refundedAmount += t.amount || 0;
        }
      }
    }

    const completedAvg = completedCount > 0 ? totalRevenue / completedCount : 0;

    return {
      totalRevenue,
      completedCount,
      completedAvg,
      pendingCount,
      failedOrRefundedCount,
      refundedAmount,
    };
  };

  // Filter + sort the list the user actually sees
  const getFilteredTransactions = () => {
    let result = [...transactions];

    // Text search
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter((t) => {
        return (
          t.customer_name.toLowerCase().includes(q) ||
          t.customer_email.toLowerCase().includes(q) ||
          (t.transaction_id && t.transaction_id.toLowerCase().includes(q))
        );
      });
    }

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter(
        (t) => t.status.toUpperCase() === statusFilter.toUpperCase()
      );
    }

    // Sorting
    if (sortBy === "date_desc") {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } 
    else if (sortBy === "amount_desc") {
      result.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    }

    return result;
  };

  const summary = getSummary();
  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="payments-page">
      {/* Tabs (Payments / Appointments) */}
      <div className="payments-tabs">
        <button className="payments-tab payments-tab--active">Payments</button>
        <button className="payments-tab" disabled>Appointments</button>
      </div>

      {/* Summary cards */}
      <div className="payments-summary-row">
        <div className="payments-card">
          <div className="payments-card-label">Total Revenue</div>
          <div className="payments-card-value">{formatCurrency(summary.totalRevenue)}</div>
          <div className="payments-card-sub">+12.5% from last month</div>
        </div>

        <div className="payments-card">
          <div className="payments-card-label">Completed</div>
          <div className="payments-card-value">{summary.completedCount}</div>
          <div className="payments-card-sub">{formatCurrency(summary.completedAvg)} avg</div>
        </div>

        <div className="payments-card">
          <div className="payments-card-label">Pending</div>
          <div className="payments-card-value">{summary.pendingCount}</div>
          <div className="payments-card-sub">Awaiting processing</div>
        </div>

        <div className="payments-card">
          <div className="payments-card-label">Failed / Refunded</div>
          <div className="payments-card-value">{summary.failedOrRefundedCount}</div>
          <div className="payments-card-sub">{formatCurrency(summary.refundedAmount)} refunded</div>
        </div>
      </div>

      {/* Filters + header row */}
      <div className="payments-filters-card">
        <div className="payments-filters-header">
          <div>
            <div className="payments-filters-title">Payment Transactions</div>
            <div className="payments-filters-sub">View and manage all payment transactions</div>
          </div>
          <button className="payments-export-btn">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="payments-filters-row">
          {/* Search */}
          <div className="payments-filter">
            <div className="payments-input-wrapper">
              <Search size={14} className="payments-input-icon" />
              <input
                type="text"
                placeholder="Customer, email, or transaction ID..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="payments-input"
              />
            </div>
          </div>

          {/* Status filter */}
          <div className="payments-filter">
            <label className="payments-filter-label">Status</label>
            <select className="payments-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          {/* Date range – just UI for now */}
          <div className="payments-filter">
            <label className="payments-filter-label">Date Range</label>
            <button className="payments-date-btn"><CalendarIcon size={14} /><span>Select date</span></button>
          </div>
        </div>

        <div className="payments-filters-footer">
          <span>Showing {filteredTransactions.length} of {transactions.length}{" "}transactions
          </span>
          <div className="payments-sort-buttons">
            <button
              className={`payments-sort-btn ${sortBy === "date_desc" ? "payments-sort-btn--active" : ""}`}
              onClick={() => setSortBy("date_desc")}
            >
              Date ↓
            </button>
            <button
              className={`payments-sort-btn ${
                sortBy === "amount_desc" ? "payments-sort-btn--active" : ""
              }`}
              onClick={() => setSortBy("amount_desc")}
            >
              Amount ↓
            </button>
          </div>
        </div>
      </div>

      {/* Transactions list */}
      <div className="payments-list">
        {filteredTransactions.map((t) => {
          const dt = formatDateTime(t.date);
          const status = (t.status || "").toLowerCase();

          let statusClass = "status-pill--default";
          if (status === "failed") statusClass = "status-pill--failed";
          else if (status === "pending") statusClass = "status-pill--pending";
          else if (status === "refunded") statusClass = "status-pill--refunded";
          else if (status === "completed" || status === "successful")
            statusClass = "status-pill--success";

          return (
            <div key={t.payment_id} className="payment-row">
              <div className="payment-row-main">
                <div className="payment-row-col payment-row-col--date">
                  <div className="payment-date">{dt.date}</div>
                  <div className="payment-time">{dt.time}</div>
                </div>

                <div className="payment-row-col payment-row-col--customer">
                  <div className="payment-name">{t.customer_name}</div>
                  <div className="payment-email">{t.customer_email}</div>
                </div>

                <div className="payment-row-col payment-row-col--items">
                  <div className="payment-tags">
                    {t.items.map((itemName, idx) => (
                      <span key={idx} className="payment-tag">{itemName}</span>
                    ))}
                  </div>
                  <div className="payment-stylist">
                    by {t.stylist || "N/A"}
                  </div>
                </div>

                <div className="payment-row-col payment-row-col--amount">
                  <div className="payment-amount">
                    {formatCurrency(t.amount)}
                  </div>
                  <div className="payment-method">{t.payment_method}</div>
                </div>

                <div className="payment-row-col payment-row-col--status">
                  <span className={`status-pill ${statusClass}`}>
                    {t.status}
                  </span>
                  <div className="payment-txn-id">{t.transaction_id}</div>
                </div>
              </div>

              {t.refund_reason && (
                <div className="payment-refund-row">
                  <span className="payment-refund-label">Refund reason:</span>
                  <span className="payment-refund-text">
                    {t.refund_reason}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {filteredTransactions.length === 0 && (
          <div className="payments-empty-state">
            No transactions match your filters.
          </div>
        )}
      </div>
    </div>
  );
}

export default SalonPaymentsPage;