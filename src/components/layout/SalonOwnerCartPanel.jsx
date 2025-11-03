import { ChevronRight } from 'lucide-react';

/* CartPanel component for any user */
function SalonOwnerCartPanel({onClose}){

    return(
        <div className="cart-panel">
            <button className="cart-panel-close-button" onClick={onClose}>
                <ChevronRight strokeWidth={3} />
            </button>
            <ul>
                <li>Checkout</li>
                <li>Sorry You're Broke</li>
                <li>Salon Owner Cart Panel</li>
            </ul>
        </div>
    )

}

export default SalonOwnerCartPanel