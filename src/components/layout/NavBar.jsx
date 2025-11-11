import { ChevronLeft } from 'lucide-react';

/* NavBar component for an unregistered user */
function NavBar({onClose}){

    return(
        <div className="nav-bar">
            <button className="nav-close-button" onClick={onClose}>
                <ChevronLeft strokeWidth={3} />
            </button>
            <h1>Login to see the Navigation Bar</h1>
        </div>
        
    );

}

export default NavBar;