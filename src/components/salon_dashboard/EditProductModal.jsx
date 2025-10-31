import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';

function EditProductModal({ isOpen, onClose, product, onProductUpdated }) {

    const [formData, setFormData] = useState({
        productName: "",
        price: "",
        quantity: "",
    });

    const [iconFile, setIconFile] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Populate form with existing product data when modal opens
    useEffect(() => {
        if (product && isOpen) {
            setFormData({
                productName: product.name || "",
                price: product.price || "",
                quantity: product.quantity || "",
            });
            setIconFile(null);
            setShowDeleteConfirm(false);
        }
    }, [product, isOpen]);

    // Text input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Image Upload - only allow one file
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIconFile(file);
        }
    };

    const submitProduct = async (e) => {
        e.preventDefault();

        try {
            // Json for backend
            const payload = {
                name: formData.productName,
                price: parseFloat(formData.price),
                stock_qty: parseInt(formData.quantity),
                salon_id: product.salon_id, // optional
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/update-product/${product.id}`, {
                method: 'PUT',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update product');
            }

            console.log('Product updated successfully:', data);

            // Refresh
            if (onProductUpdated) {
                onProductUpdated();
            }
            
            onClose();

        } 
        catch (err) {
            console.error("Error updating product:", err);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    }

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    }

    const confirmDelete = async() => {
        
        if(!product?.id){
            return;
        }

        try{
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/salon_register/delete_product/${product.id}`, {
                method: 'DELETE',
                headers: {Accept: 'application/json'}
            });

            const data = await res.json().catch(() => ({}));

            console.log('Product deleted: ', data);
            onProductUpdated?.();
            onClose();
        }
        
        catch (err){
            console.error('Error deleting service: ', err);
        }

        setShowDeleteConfirm(false);
    }

    // Reset form and close
    const handleBack = () => {
        setFormData({
            productName: "",
            price: "",
            duration: "",
        });
        setIconFile(null);
        setShowDeleteConfirm(false);
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="add-service-modal-overlay" onClick={handleBack}>
            <div className="add-service-modal-content" onClick={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <div className="add-service-modal-header">
                    <h2 className="add-service-header-title">Edit Product</h2>
                    <button className="add-service-close-btn" onClick={handleBack}>
                        <X size={24} />
                    </button>
                </div>

                <hr className="add-service-divider" />

                {/* Current Icon Preview */}
                {product?.icon_url && !iconFile && (
                    <div style={{ marginBottom: '15px', textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Current Image:</p>
                        <img 
                            src={product.icon_url} 
                            alt={product.name}
                            style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '8px' }}
                        />
                    </div>
                )}

                {/* Form with Details */}
                <form onSubmit={submitProduct} className="add-service-form">
                    <label className="add-service-label">Product:</label>
                    
                    <input
                        type="text"
                        name="productName"
                        placeholder="Product Name"
                        value={formData.productName}
                        onChange={handleChange}
                        className="add-service-service-name-box"
                        required
                    />

                    <div className="add-service-row">
                        <input
                            type="number"
                            name="price"
                            placeholder="Price"
                            value={formData.price}
                            onChange={handleChange}
                            className="add-service-price-box"
                            step="0.01"
                            min="0"
                            required
                        />
                        
                        <input
                            type="number"
                            name="quantity"
                            placeholder="Qty"
                            value={formData.quantity}
                            onChange={handleChange}
                            className="add-service-price-box"
                            min="0"
                            required
                        />
                        
                        <label className="add-service-upload-btn">
                            <Upload size={16} />
                            {iconFile ? iconFile.name : 'Change Image'}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>

                    {/* Footer Buttons */}
                    <div className="add-service-actions">
                        <button type="button" onClick={handleBack} className="add-service-back-btn">Back</button>
                        <button type="button" onClick={handleDeleteClick} className="add-service-delete-btn">Delete Product</button>
                        <button type="submit" className="add-service-submit-btn"> Save Changes </button>
                    </div>
                </form>

                {/* Delete Modal */}
                {showDeleteConfirm && (
                    <div className="add-service-modal-overlay" onClick={cancelDelete}>
                        <div className="add-service-modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3>Delete product?</h3>
                            <p>Are you sure you want to delete “{product?.name}”? This cannot be undone.</p>
                            <div className="add-service-actions">
                                <button onClick={cancelDelete} className="add-service-back-btn">Cancel</button>
                                <button onClick={confirmDelete} className="add-service-delete-btn">Delete</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EditProductModal;