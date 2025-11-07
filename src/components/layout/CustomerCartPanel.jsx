import { useEffect, useState } from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';

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
        const idForDelete = kind === 'service' ? item.service_id
                         : kind === 'product' ? item.product_id
                         : null;

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

    return (
        <div className="cart-panel">
            {/* Close Panel */}
            <button className="cart-panel-close-button" onClick={onClose}>
                <ChevronRight strokeWidth={3} />
            </button>

            <h4>Customer Cart (User 1)</h4>

            {cart?.items?.length > 0 ? (
                <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0 }}>
                    {cart.items.map((item) => {
                        if (item.item_type === 'service') {
                            const price = Number(item.service_price) || 0;

                            return (
                                <li key={item.item_id} style={{ marginBottom: 12 }}>
                                    <p><strong>Salon:</strong> {item.service_salon_name}</p>
                                    <p><strong>Service:</strong> {item.service_name}</p>
                                    <p><strong>Price:</strong> ${price.toFixed(2)}</p>
                                    {item.appt_date && (
                                        <p>
                                            <strong>Appt:</strong> {item.appt_date} at {item.appt_time}
                                        </p>
                                    )}
                                    <button onClick={() => handleDeleteItem(item)}>
                                        <Trash2 size={16} /> Delete
                                    </button>
                                    <hr />
                                </li>
                            );
                        }
                        else if (item.item_type === 'product') {
                            const price = Number(item.product_price) || 0;

                            return (
                                <li key={item.item_id} style={{ marginBottom: 12 }}>
                                    <p><strong>Product:</strong> {item.product_name}</p>
                                    <p><strong>Quantity:</strong> {item.quantity}</p>
                                    <p><strong>Price:</strong> ${price.toFixed(2)}</p>
                                    <button onClick={() => handleDeleteItem(item)}>
                                        <Trash2 size={16} /> Delete
                                    </button>
                                    <hr />
                                </li>
                            );
                        }

                        // Unknown row shape (skip)
                        return null;
                    })}
                </ul>
            ) : (
                <p>No items in cart.</p>
            )}
        </div>
    );
}

export default CustomerCartPanel;
