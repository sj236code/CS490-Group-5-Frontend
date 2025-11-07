import RestrictedCartPanel from './RestrictedCartPanel';

/* CartPanel component for any user */
function AdminCartPanel({ onClose, userId, userName, onLogout }){

  return (
    <RestrictedCartPanel
      onClose={onClose}
      userType="Admin"
      userId={userId}
      userName={userName}
      onLogout={onLogout}
    />
  );

}

export default AdminCartPanel