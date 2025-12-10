import { ChevronRight } from 'lucide-react';
import RestrictedCartPanel from './RestrictedCartPanel';


/* CartPanel component for any user */
function CartPanel({onClose}){

    return(
        <div className="cart-panel-overlay" onClick={onClose}>
            <RestrictedCartPanel
            onClose={onClose}
            userType="Guest"
            userId={null}
            userName={null}
            onLogout={null}
            />
        </div>
        
    )

}

export default CartPanel