import { ChevronLeft, CircleUserRound, ShieldCheck } from 'lucide-react';

/* NavBar component for an salon owner user */
function SalonOwnerNavBar({onClose}){

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
        </div>
        
    );

}

export default SalonOwnerNavBar;