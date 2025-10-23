import { ChevronLeft } from 'lucide-react';

/* NavBar component for an employee user */
function EmployeeNavBar({onClose}){

    return(
        <div className="nav-bar">
            <button className="nav-close-button" onClick={onClose}>
                <ChevronLeft strokeWidth={3} />
            </button>
            <ul>
                <li>Employee</li>
                <li>Nav Bar</li>
            </ul>
        </div>
        
    );

}

export default EmployeeNavBar;