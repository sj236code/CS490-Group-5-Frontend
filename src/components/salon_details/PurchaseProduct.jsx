import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { resolvePath } from 'react-router-dom';

function PurchaseProduct({ isOpen, onClose, product, salon }) {
  const [qty, setQty] = useState(1);
  const [cartData, setCartData] = useState({
    user_id: 1,            // TODO: replace with real user
    product_id: '',
    product_name: '',
    quantity: 1,
    salon: null,           // could be id or name; backend just passes it through
    price: 0
  });

  useEffect(() => {
    if (isOpen) {
        setQty(1);
        setCartData(prev => ({
            ...prev,
            product_id: product?.id ?? '',
            product_name: product?.name ?? '',
            price: Number(product?.price ?? 0),
            salon: salon?.id ?? salon?.title ?? salon?.name ?? null,
        }));
    }
  }, [isOpen, product, salon]);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

    const handleAddToCart = async () => {
        try {
            const payload = {
                user_id: cartData.user_id,
                product_id: cartData.product_id,
                product_name: cartData.product_name,
                quantity: Number(qty) || 1,
                salon: cartData.salon,
                price: Number(cartData.price) || 0,
            };

            if (!payload.user_id || !payload.product_id || !payload.product_name) {
                console.error('Missing required fields', payload);
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/add-product`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            console.log('Product added to cart:', data);
            onClose(); 
        }

        catch (err) {
            console.error('Add to cart error:', err);
        }
    };

  return (
    <div className="add-service-modal-overlay" onClick={handleClose}>
      <div className="add-service-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="add-service-modal-header">
          <h2 className="add-service-header-title">Add to Cart</h2>
          <button className="add-service-close-btn" onClick={handleClose}><X size={24} /></button>
        </div>

        <hr className="add-service-divider" />

        <div className="add-service-form" style={{ textAlign: 'left' }}>
          <p><strong>Product:</strong> {product?.name ?? '—'}</p>
          <p><strong>Salon:</strong> {salon?.title ?? salon?.name ?? '—'}</p>
          <p><strong>Price:</strong> ${Number(product?.price ?? 0).toFixed(2)}</p>

          <label className="add-service-label" htmlFor="qty">Quantity</label>
          <input
            id="qty"
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            className="add-service-price-box"
            style={{ width: 120 }}
          />

          <div className="add-service-actions">
            <button type="button" onClick={handleClose} className="add-service-back-btn">Cancel</button>
            <button type="button" onClick={handleAddToCart} className="add-service-submit-btn"> Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PurchaseProduct;
