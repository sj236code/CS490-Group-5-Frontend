import { useEffect, useState } from 'react';
import { ChevronRight, Trash2, ShoppingCart, Scissors, Milk } from 'lucide-react';

function CustomerCartPanel({ onClose }) {

    const [cart, setCart] = useState(null); // Cart data

    // Runs once component mounts
    useEffect(() => {
        fetchCart();
    }, []);

    // Fetch cart for user 1
    const fetchCart = async () => {
        const userId = 1; // hardcoded for testing
        const url = `${import.meta.env.VITE_API_URL}/api/cart/${userId}`;

        try {
            const res = await fetch(url);
            const data = await res.json();

            console.log('Cart data:', data);
            setCart(data);
        }
        catch (err) {
            console.error('Error fetching cart:', err);
        }
    };

    // Delete item (service or product)
    const handleDeleteItem = async (item) => {
        if (!cart?.cart_id) {
            console.warn('No cart_id available yet.');
            return;
        }

        // Determine kind & item_id for backend (accepts both)
        const kind = item.item_type; 
        const idForDelete = 
                        kind === 'service' ? item.service_id : 
                        kind === 'product' ? item.product_id : null;

        if (!idForDelete) {
            console.warn('Missing product_id/service_id on item:', item);
            return;
        }

        const qs = new URLSearchParams({
            cart_id: String(cart.cart_id),
            item_id: String(idForDelete),
            kind,
        }).toString();

        const url = `${import.meta.env.VITE_API_URL}/api/cart/delete-cart-item?${qs}`;
        console.log('DELETE =>', url);

        try {
            const res = await fetch(url, { method: 'DELETE' });
            const text = await res.text();
            let data;
            try { data = JSON.parse(text); } catch { data = { raw: text }; }

            console.log('Delete response status:', res.status);
            console.log('Delete response body:', data);

            if (!res.ok) {
                console.error('Delete failed:', res.status, data);
                return;
            }

            // Optimistic update: remove the item from local state
            setCart((prev) => {
                if (!prev) return prev;
                const filtered = (prev.items || []).filter((it) => {
                    if (kind === 'service') return it.service_id !== item.service_id;
                    if (kind === 'product') return it.product_id !== item.product_id;
                    return true;
                });
                const updated = { ...prev, items: filtered, total_items: filtered.length };
                console.log('Cart after delete (local):', updated);
                return updated;
            });
        }
        catch (err) {
            console.error('Delete request error:', err);
        }
    };

    const navTo = (path) => {
        navigate(path);
        onClose();
    }

    const services = (cart?.items || []).filter(i => i.item_type === 'service');
    const products = (cart?.items || []).filter(i => i.item_type === 'product');

    const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
    const subtotal =
        services.reduce((s, it) => s + num(it.service_price), 0) +
        products.reduce((s, it) => s + num(it.product_price) * (num(it.quantity) || 1), 0);

    const taxRate = Number(import.meta.env.VITE_TAX_RATE) || 0.066; // default NJ-esque
    const salesTax = subtotal * taxRate;
    const total = subtotal + salesTax;
    const money = (n) => `$${n.toFixed(2)}`;

    const changeQty = async (item, direction) => {
    if (!cart) return;

    const current = Number(item.quantity) || 1;
    const next = direction === 'up' ? current + 1 : current - 1;
    if (next < 1) return; // or call handleDeleteItem(item)

    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/update-item-quantity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            cart_id: cart.cart_id,
            item_id: item.product_id,  
            kind: 'product',
            quantity: next,
        }),
        });

        const payload = await res.text();
        let json;
        try { json = JSON.parse(payload); } catch { json = { raw: payload }; }
        console.log('Qty PATCH status:', res.status, 'body:', json);

        if (!res.ok) return;

        // Optional: optimistic UI
        setCart(prev => {
        if (!prev) return prev;
        const items = (prev.items || []).map(it =>
            it.product_id === item.product_id ? { ...it, quantity: next } : it
        );
        return { ...prev, items };
        });

        // Authoritative refresh
        fetchCart();
    } catch (err) {
        console.error('Qty update error:', err);
    }
    };


    return (
        <div className="cart-panel">
            {/* Close Panel */}
            <button className="cart-panel-close-button" onClick={onClose}>
                <ChevronRight strokeWidth={3} />
            </button>

            {/* Header */}
            <div className="cart-header">
                <span className="cart-header-icon"><ShoppingCart /></span>
                <span className="cart-title">Cart</span>
            </div>

            {/* Services */}
            <div className="cart-section">
                <div className="cart-section-title">Services</div>

                {services.length === 0 && <p className="cart-empty-text">No services in cart.</p>}

                {services.map((item) => {
                const price = num(item.service_price);
                return (
                    <div className="cart-item" key={`svc-${item.item_id}`}>
                    <div className="cart-item-left">
                        <div className="cart-item-icon"><Scissors /></div>
                        <div className="cart-item-text">
                        <div className="cart-item-title">{item.service_name || 'Service'}</div>
                        <div className="cart-item-subtitle">{item.service_salon_name}</div>
                        {item.appt_date && (
                            <div className="cart-item-note">
                            {item.appt_date}{item.appt_time ? ` • ${item.appt_time}` : ''}
                            </div>
                        )}
                        </div>
                    </div>

                    <div className="cart-item-right">
                        <div className="cart-item-price">{money(price)}</div>
                        <button className="cart-icon-button" onClick={() => handleDeleteItem(item)}>
                        <Trash2 size={14} />
                        </button>
                    </div>
                    </div>
                );
                })}

            </div>

            {/* Products */}
            <div className="cart-section">
                <div className="cart-section-title">Products</div>

                {products.length === 0 && <p className="cart-empty-text">No products in cart.</p>}

                {products.map((item) => {
                    const unit = num(item.product_price);
                    const qty = num(item.quantity) || 1;
                    const line = unit * qty;

                    return (
                        <div className="cart-item" key={`prd-${item.item_id}`}>
                        <div className="cart-item-left">
                            <div className="cart-item-icon"><Milk /></div>
                            <div className="cart-item-text">
                            <div className="cart-item-title">{item.product_name || 'Product'}</div>
                            
                                {/* qty UI */}
                                <div className="qty-controls">
                                    <button className="qty-btn" onClick={() => changeQty(item, 'down')}>−</button>
                                    <span className="qty-count">{qty}</span>
                                    <button className="qty-btn" onClick={() => changeQty(item, 'up')}>+</button>
                                </div>

                            </div>
                        </div>

                        <div className="cart-item-right">
                            <div className="cart-item-price">{money(line)}</div>
                            <button className="cart-icon-button" onClick={() => handleDeleteItem(item)}>
                            <Trash2 size={14} />
                            </button>
                        </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer totals + checkout */}
            <div className="cart-footer">
                <div className="cart-row">
                <span>Sales Tax</span>
                <span>{money(salesTax)}</span>
                </div>
                <div className="cart-row cart-row-total">
                <span>Total</span>
                <span>{money(total)}</span>
                </div>
                <button className="cart-checkout-button" onClick={() => navTo('/checkout')}>Checkout</button>
            </div>

        </div>
    );
}

export default CustomerCartPanel;
