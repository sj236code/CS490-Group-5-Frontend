import { ChevronLeft } from 'lucide-react';

/* NavBar component for an salon owner user */
function SalonOwnerNavBar({onClose}){

    return(
        <div className="nav-bar">
            <button className="nav-close-button" onClick={onClose}>
                <ChevronLeft strokeWidth={3} />
            </button>
            <ul>
                <li>Salon Owner</li>
                <li>Nav Bar</li>
            </ul>
        </div>
        
    );

}

export default SalonOwnerNavBar;