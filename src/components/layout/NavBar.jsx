import { ChevronLeft } from 'lucide-react';

/* NavBar component for an unregistered user */
function NavBar({onClose}){

    return(
        <div className="nav-bar">
            <button className="close-button" onClick={onClose}>
                <ChevronLeft strokeWidth={3} />
            </button>
            <ul>
                <li>Sign In</li>
                <li>Sign Up</li>
            </ul>
        </div>
        
    );

}

export default NavBar;