import { ChevronLeft, CircleUserRound, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { useNavigate} from 'react-router-dom';

/* NavBar component for an salon owner user */
function SalonOwnerNavBar({onClose, onLogout, userId, user, salonId}){

    const navigate = useNavigate();

    const navTo = (path) => {
        navigate(path, {state: {userId, user, salonId: effectiveSalonId}});
        onClose();
    }

    const navToDashboard = () => {
        navigate('/salonDashboard', {
            state: {
                salon: {
                    id: salonId
                },
                userId, user,
            }
        });
        onClose();
    }

    const navToSettings = () => {
        navigate('/salonSettings', {
        state: {
            salonId: effectiveSalonId,
            user,
        },
        });
        onClose();
    };

    const displayName = user?.first_name ? `${user.first_name} ${user.last_name ?? ''}`.trim() : 'SalonOwner';
    const employeeNumber = user?.profile_id ?? userId ?? '-';
    const effectiveSalonId = salonId ?? user?.profile_id ?? userId ?? null;

    const handleLogout = () => {
        console.log('Logout button clicked');
        if(onLogout) {
            onLogout();
            console.log('Logout succeeded');
        }
        onClose();
    };

    return(
        <div className="nav-bar-overlay" onClick={onClose}>
            <div className="nav-bar" onClick={e => e.stopPropagation()}>
                <button className="nav-close-button" onClick={onClose}>
                    <ChevronLeft strokeWidth={3} />
                </button>

                {/* Profile Section */}
                <div className="nb-profile-section">
                    <CircleUserRound className="nb-profile-icon" />
                    <div className="nb-profile-info">
                        <p className="nb-user-name">{displayName}</p>
                        <p className="nb-user-tag">Salon Owner #{employeeNumber}</p>
                        <div className="nb-verified">
                            <ShieldCheck className="nb-verified-icon" />
                            <span>Verified</span>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}

                {/* MyJade Account */}
                <div className="nb-section">
                    <div className="nb-section-title">MyJade Account</div>
                    <button className="nb-text-link" onClick={handleLogout}>Log Out</button>
                </div>

                {/* Salon Owner */}
                <div className="nb-section">
                    <div className="nb-section-title">Salon Owner</div>
                    <button className="nb-text-link" onClick={navToDashboard}>Dashboard</button>
                    <button className="nb-text-link" onClick={navToSettings}>Settings</button>
                    <button className="nb-text-link" onClick={() => navTo('/salonPayments')}>Payments</button>
                    <button className="nb-text-link" onClick={() => navTo('/owner/appointments')}>Appointments</button>
                </div>

                {/* Footer */}
                <div className="nb-footer">
                    <button className="nb-footer-link" onClick={() => navTo('/contact')}>Contact</button>
                    <button className="nb-footer-link" onClick={() => navTo('/faq')}>FAQ</button>
                    <div className="nb-footer-link">Copywright ©</div>
                </div>

            </div>
        </div>
    );
}

export default SalonOwnerNavBar;