import { useEffect, useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { useLocation } from "react-router-dom";
import AddPaymentMethod from "../components/layout/AddPaymentMethod";

function MyWallet() {
  const location = useLocation();
  const userFromState = location.state?.user || null;
  const userIdFromState = location.state?.userId || null;
  const user = userFromState;

  // Same logic as navbar: use profile_id for customers, fallback to auth user id.
  const customerId = user?.profile_id ?? userIdFromState ?? null;

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name ?? ""}`.trim()
    : "Customer";

  const [methods, setMethods] = useState([]);
  const [showAddPayment, setShowAddPayment] = useState(false);

  // Fetch payment methods only once we have a valid customerId
  useEffect(() => {
    if (!customerId) {
      console.warn("MyWallet: no customerId available yet.");
      return;
    }
    fetchMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  // Fetch payment methods for customer
  const fetchMethods = async () => {
    if (!customerId) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payments/${customerId}/methods`
      );

      if (!response.ok) {
        console.error("Failed to fetch payment methods");
        setMethods([]);
        return;
      }

      const data = await response.json();

      const mapped = (data || []).map((method) => ({
        id: method.id,
        brand: method.brand, // visa, mastercard, etc
        last4: method.last4,
        name: displayName,
        exp: formatExpiration(method.expiration), // MM/YYYY
        added: formatCreatedAt(method.created_at), // Nov 8, 2025
        isDefault: !!method.is_default,
      }));

      setMethods(mapped);
      console.log("Payment methods loaded:", mapped);
    } 
    catch (err) {
      console.error("Unable to fetch payment methods. Error:", err);
      setMethods([]);
    }
  };

  // Convert "2029-02-22T00:00:00" → "02/2029"
  const formatExpiration = (isoString) => {
    if (!isoString) return "";
    const [datePart] = isoString.split("T"); // "YYYY-MM-DD"
    const [year, month] = datePart.split("-");
    return `${month}/${year}`;
  };

  // Convert ISO → "Nov 8, 2025"
  const formatCreatedAt = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Call backend to set default payment method
  const setDefault = async (methodId) => {
    try {
      const url = `${import.meta.env.VITE_API_URL}/api/payments/${customerId}/methods/${methodId}/set-default`;

      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 404) {
        console.error("Customer or payment method not found");
        return;
      }

      if (res.status === 403) {
        console.error("Payment method does not belong to this customer");
        return;
      }

      if (!res.ok) {
        console.error("Failed to set default payment method");
        return;
      }

      const updated = await res.json();
      console.log("Default method updated:", updated);

      setMethods((prev) =>
        prev.map((m) =>
          m.id === methodId
            ? {
                ...m,
                isDefault: !!updated.is_default,
                exp: formatExpiration(updated.expiration || m.exp),
              }
            : { ...m, isDefault: false }
        )
      );
    } 
    catch (err) {
      console.error("Error setting default payment method:", err);
    }
  };

  // Remove Payment Method
  const removeMethod = async (methodId) => {
    const confirmation = window.confirm("Are you sure you want to remove this payment method?");
    if (!confirmation) return;

    try {
      const url = `${import.meta.env.VITE_API_URL}/api/payments/${customerId}/methods/${methodId}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 404) {
        console.error("Customer or payment not found");
        return;
      }

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        console.error("Failed to delete payment method:", errBody);
        return;
      }

      const body = await response.json();
      console.log("Deleted method:", body);

      setMethods((prev) => prev.filter((m) => m.id !== methodId));
    } catch (err) {
      console.error("Error deleting payment method:", err);
    }
  };

  const addMethod = () => {
    setShowAddPayment(true);
  };

  const handleAddSuccess = () => {
    setShowAddPayment(false);
    fetchMethods();
  };

  const handleAddCancel = () => {
    setShowAddPayment(false);
  };

  // If we truly have no customerId (user navigated oddly)
  if (!customerId) {
    return (
      <div className="wallet-container">
        <div className="wallet-header">
          <div>
            <h2 className="wallet-title">My Wallet</h2>
          </div>
        </div>
        <p className="wallet-text">
          Unable to load wallet. Please navigate here from your account menu.
        </p>
      </div>
    );
  }

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <div>
          <h2 className="wallet-title">My Wallet</h2>
          <p className="wallet-subtitle">
            {methods.length === 0
              ? "Add your first payment method"
              : "Manage your payment methods"}
          </p>
        </div>
        <button className="wallet-add-btn" onClick={addMethod}>
          <Plus size={18} /> Add Payment Method
        </button>
      </div>

      {/* Add payment form */}
      {showAddPayment && (
        <AddPaymentMethod
          customerId={customerId}
          onSuccess={handleAddSuccess}
          onCancel={handleAddCancel}
        />
      )}

      {/* List or empty state */}
      {methods.length === 0 ? (
        <p className="wallet-text">No payment methods available.</p>
      ) : (
        methods.map((m) => (
          <div key={m.id} className="wallet-card">
            <div
              className={`wallet-brand ${
                (m.brand || "").toUpperCase().includes("VISA") ? "visa" : "mc"
              }`}
            >
              {m.brand || "Card"}
            </div>

            <div className="wallet-info">
              <div className="wallet-number">
                •••• •••• •••• {m.last4}
                {m.isDefault && (
                  <span className="wallet-default-badge">Default</span>
                )}
              </div>
              <div className="wallet-text">{m.name}</div>
              <div className="wallet-text">Expires {m.exp}</div>
              <div className="wallet-text">Added {m.added}</div>
            </div>

            <div className="wallet-actions">
              {!m.isDefault && (
                <button
                  className="wallet-set-btn"
                  onClick={() => setDefault(m.id)}
                >
                  <Check size={16} /> Set Default
                </button>
              )}
              <button
                className="wallet-remove-btn"
                onClick={() => removeMethod(m.id)}
              >
                <Trash2 size={16} /> Remove
              </button>
            </div>
          </div>
        ))
      )}

      <div className="wallet-security-box">
        <div className="wallet-security-header">
          <div className="wallet-info-icon">i</div>
          <div className="wallet-security-title">Security Information</div>
        </div>
        <p className="wallet-text">
          Your payment information is encrypted and securely stored. We never
          store your full card number or CVV.
        </p>
        <p className="wallet-text">
          Your default payment method will be automatically selected during
          checkout, but you can always choose a different card.
        </p>
      </div>
    </div>
  );
}

export default MyWallet;
