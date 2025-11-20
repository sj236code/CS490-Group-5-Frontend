import RestrictedCartPanel from './RestrictedCartPanel';

function SalonOwnerCartPanel({ onClose, userId, userName, onLogout }) {
  return (
    <div className="cart-panel-overlay" onClick={onClose}>
      <RestrictedCartPanel
        onClose={onClose}
        userType="Salon Owner"
        userId={userId}
        userName={userName}
        onLogout={onLogout}
      />
    </div>
    
  );
}

export default SalonOwnerCartPanel;
