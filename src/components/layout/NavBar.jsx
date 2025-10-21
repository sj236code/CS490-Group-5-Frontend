import { ChevronLeft } from 'lucide-react';

function NavBar({onClose}){

    return(
        <div className="nav-bar">
            <button className="close-button" onClick={onClose}>
                <ChevronLeft strokeWidth={3} />
            </button>
            <ul>
                <li>Home</li>
                <li>Services</li>
            </ul>
        </div>
        
    );

}

export default NavBar;