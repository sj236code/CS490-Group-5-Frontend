import { ChevronLeft } from 'lucide-react';

/* NavBar component for an customer user */
function CustomerNavBar({onClose}){

    return(
        <div className="nav-bar">
            <button className="nav-close-button" onClick={onClose}>
                <ChevronLeft strokeWidth={3} />
            </button>
            <ul>
                <li>Customer</li>
                <li>Nav Bar</li>
            </ul>
        </div>
        
    );

}

export default CustomerNavBar;