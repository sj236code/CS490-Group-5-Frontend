import RestrictedCartPanel from './RestrictedCartPanel';

function SalonOwnerCartPanel({ onClose, userId, userName, onLogout }) {
  return (
    <RestrictedCartPanel
      onClose={onClose}
      userType="Salon Owner"
      userId={userId}
      userName={userName}
      onLogout={onLogout}
    />
  );
}

export default SalonOwnerCartPanel;
