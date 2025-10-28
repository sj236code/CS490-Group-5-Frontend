import { ChevronRight } from 'lucide-react';

/* CartPanel component for any user */
function CustomerCartPanel({onClose}){

    return(
        <div className="cart-panel">
            <button className="cart-panel-close-button" onClick={onClose}>
                <ChevronRight strokeWidth={3} />
            </button>
            <ul>
                <li>Checkout</li>
                <li>Sorry You're Broke</li>
                <li>Customer Cart</li>
            </ul>
        </div>
    )

}

export default CustomerCartPanel