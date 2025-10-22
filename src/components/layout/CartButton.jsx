import { ShoppingCart, ShoppingBag } from 'lucide-react';

/* CartButton component to open CartPanel */
function CartButton({onClick}){

    return(
        <button
            className='cart-icon'
            onClick={onClick}
        >
            <ShoppingCart strokeWidth={3} size={24} />
        </button>
    );

}

export default CartButton