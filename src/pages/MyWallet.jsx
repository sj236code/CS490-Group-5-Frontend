import { useEffect, useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import AddPaymentMethod from "../components/layout/AddPaymentMethod";

function MyWallet() {
  // TODO: replace with real logged in customer id
  const customerId = 1;

  const [methods, setMethods] = useState([]);
  const [showAddPayment, setShowAddPayment] = useState(false);

  useEffect(() => {
    fetchMethods();
  }, []);

  // Fetch payment methods for customer
  const fetchMethods = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/${customerId}/methods`);

      if (!response.ok) {
        console.error("Failed to fetch payment methods");
        setMethods([]);
        return;
      }

      const data = await response.json();

      // console.log("All Card Data: ", data);

      const mapped = (data || []).map((method) => ({
        id: method.id,
        brand: method.brand, // visa, mastercard, discover etc
        last4: method.last4,
        name: "John Doe", // placeholder
        exp: formatExpiration(method.expiration), // MM/YYYY
        added: formatCreatedAt(method.created_at), // Nov 8, 2025
        isDefault: !!method.is_default,
      }));

      setMethods(mapped);
      console.log("Payment methods loaded: ", mapped);
    } 
    catch (err) {
      console.error("Unable to fetch payment methods. Error: ", err);
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
        headers: {
          "Content-Type": "application/json",
        },
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

      // Update local state: only this method is default
      setMethods((prev) =>
        prev.map((m) =>
          m.id === methodId ? {
            ...m,
            isDefault: !!updated.is_default,
            exp: formatExpiration(updated.expiration || m.exp),
            added: formatCreatedAt(updated.updated_at || updated.created_at || m.added),
          } : { ...m, isDefault: false }
        )
      );
    } 
    catch (err) {
      console.error("Error setting default payment method:", err);
    }
  };

  // Remove Payment Method given a customer id
  const removeMethod = async(methodId) => {
    const confirmation = window.confirm("Are you sure you want to remove this payment method?");
    if (!confirmation){
      return
    };

    try{
      const url = `${import.meta.env.VITE_API_URL}/api/payments/${customerId}/methods/${methodId}`;

      const response = await fetch(url, {
        method: "DELETE", 
        headers:{"Content-Type": "application/json",},
      });

      if(response.status === 404){
        console.error("Customer or payment not found");
        return;
      }

      if (!response.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error("Failed to delete payment method:", errBody);
        return;
      }

      const body = await response.json();
      console.log("Delete method: ", body);

      setMethods((prev) => prev.filter((m) => m.id !== methodId));
    }
    catch(err){
      console.error("Error deleting payment method: ", err);
    }
  };

  const addMethod = () => {
    setShowAddPayment(true);
  };

  const handleAddSuccess = () => {
    setShowAddPayment(false);
    fetchMethods();
  }

  const handleAddCancel = () => {
    setShowAddPayment(false);
  };

  if (methods.length === 0) {
    return (
      <div className="wallet-container">
        <div className="wallet-header">
          <div>
            <h2 className="wallet-title">My Wallet</h2>
          </div>
          <button className="wallet-add-btn" onClick={addMethod}>
            <Plus size={18} />
            Add Payment Method
          </button>
        </div>
        <p className="wallet-text">No payment methods available.</p>

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

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <div>
          <h2 className="wallet-title">My Wallet</h2>
          <p className="wallet-subtitle">Manage your payment methods</p>
        </div>
        <button className="wallet-add-btn" onClick={addMethod}><Plus size={18} />Add Payment Method</button>
      </div>

      {showAddPayment && (
        <AddPaymentMethod customerId={customerId} onSuccess={handleAddSuccess} onCancel={handleAddCancel} />
      )}

      {methods.map((m) => (
        <div key={m.id} className="wallet-card">
          <div className={`wallet-brand ${(m.brand || "").toUpperCase().includes("VISA") ? "visa" : "mc"}`}>
            {m.brand || "Card"}
          </div>

          <div className="wallet-info">
            <div className="wallet-number">
              •••• •••• •••• {m.last4}
              {m.isDefault && (<span className="wallet-default-badge">Default</span>)}
            </div>
            <div className="wallet-text">{m.name}</div>
            <div className="wallet-text">Expires {m.exp}</div>
            <div className="wallet-text">Added {m.added}</div>
          </div>

          <div className="wallet-actions">
            {!m.isDefault && (
              <button className="wallet-set-btn"onClick={() => setDefault(m.id)}>
                <Check size={16} /> Set Default
              </button>
            )}
            <button className="wallet-remove-btn" onClick={() => removeMethod(m.id)}>
              <Trash2 size={16} /> Remove
            </button>
          </div>
        </div>
      ))}

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
