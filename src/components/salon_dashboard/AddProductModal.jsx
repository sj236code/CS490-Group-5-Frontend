import { useState } from 'react';
import { X, Upload } from 'lucide-react';

function AddProductModal({ isOpen, onClose, salonId, onProductAdded }) {

    const [formData, setFormData] = useState({
        productName: "",
        price: "",
        quantity: "",
    });

    const [images, setImages] = useState([]);

      // Text input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Image Upload
    const handleImageUpload = (e) => {
        const file = Array.from(e.target.files);
        setImages((prev) => [...prev, ...files]);
    }

    const submitProduct = (e) => {
        e.preventDefault();

        const newProduct = {
            id: salonId,
            name: formData.productName,
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity),
            images: images.map((img) => URL.createObjectURL(img)),
        };

        console.log('New product:', newProduct);

        setFormData({
            productName: "",
            price: "",
            quantity: "",
        });

        // Reset form
        setImages([]);

        if (onProductAdded) {
            onProductAdded();
        }
        
        onClose();
    };
        
    // TODO: Replace with actual API call when endpoint is ready
    // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salons/${salonId}/services`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(formData)
    // });

    // Reset images
    const handleBack = () => {
        setImages([]);
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
                    <h2 className="add-service-header-title">Add a Product</h2>
                    <button className="add-service-close-btn" onClick={handleBack}>
                        <X size={24} />
                    </button>
                </div>

                <hr className="add-service-divider" />

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
                            Upload Images
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>


                    {/* Footer Buttons */}
                    <div className="add-service-actions">
                        <button type="button" onClick={handleBack} className="add-service-back-btn">
                            Back
                        </button>
                        <button type="submit" className="add-service-submit-btn">
                            Add Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddProductModal;