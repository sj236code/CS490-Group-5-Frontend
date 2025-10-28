import { ChevronLeft, CircleUserRound, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { useNavigate} from 'react-router-dom';

/* NavBar component for an salon owner user */
function SalonOwnerNavBar({onClose}){

    const navigate = useNavigate();

    const navToDashboard = () => {
        navigate('/salonDashboard', {
            state: {
                salon: {
                    id: 6
                }
            }
        });
        onClose();
    }

    return(
        <div className="nav-bar">
            <button className="nav-close-button" onClick={onClose}>
                <ChevronLeft strokeWidth={3} />
            </button>

            {/* Profile Section */}
            <div className="nb-profile-section">
                <CircleUserRound className="nb-profile-icon" />
                <div className="nb-profile-info">
                    <p className="nb-user-name">John Smith</p>
                    <p className="nb-user-tag">[Salon Name] Owner</p>
                    <div className="nb-verified">
                        <ShieldCheck className="nb-verified-icon" />
                        <span>Verified</span>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="nb-links-section">
                <button className="nb-link-button" onClick={navToDashboard}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </button>
            </div>

        </div>
        
    );

}

export default SalonOwnerNavBar;