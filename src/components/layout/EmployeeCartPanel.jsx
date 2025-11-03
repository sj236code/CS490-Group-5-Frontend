import { ChevronRight } from 'lucide-react';

/* CartPanel component for any user */
function EmployeeCartPanel({onClose}){

    return(
        <div className="cart-panel">
            <button className="cart-panel-close-button" onClick={onClose}>
                <ChevronRight strokeWidth={3} />
            </button>
            <ul>
                <li>Checkout</li>
                <li>Sorry You're Broke</li>
                <li>Employee Cart Panel</li>
            </ul>
        </div>
    )

}

export default EmployeeCartPanel