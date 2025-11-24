import { ChevronRight } from 'lucide-react';

/* CartPanel component for any user */
function CartPanel({onClose}){

    return(
        <div className="cart-panel-overlay" onClick={onClose}>
            <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
                <button className="cart-panel-close-button" onClick={onClose}>
                    <ChevronRight strokeWidth={3} />
                </button>
                <ul>
                    <li>Checkout</li>
                    <li>Sorry You're Broke</li>
                </ul>
            </div>
        </div>
        
    )

}

export default CartPanel