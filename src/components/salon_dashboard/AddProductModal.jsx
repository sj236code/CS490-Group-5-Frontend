import { useState } from 'react';
import { X, Upload } from 'lucide-react';

function AddProductModal({ isOpen, onClose, salonId, onProductAdded }) {

    const [formData, setFormData] = useState({
        productName: "",
        price: "",
        quantity: "",
    });

    const [images, setImages] = useState([]);
    const [imageFile, setImageFile] = useState(null);


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
        const files = e.target.files;
        if (!files || !files.length) return;
        setImageFile(files[0]);
    };

    const submitProduct = async(e) => {
        e.preventDefault();

        try{

            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.productName);
            formDataToSend.append('salon_id', salonId);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('stock_qty', formData.quantity);
            formDataToSend.append('is_active', 'true');

            if(imageFile){
                formDataToSend.append("image_url", imageFile);
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salon_register/add_product`, { method: 'POST', body: formDataToSend,});

            const data = await response.json();

            if(!response.ok){
                throw new Error(data.error || 'Failed. ');
            }

            console.log('Product added successfully: ', data);

            setFormData({
                productName: "",
                price: "",
                quantity: "",
            });

            setImages([]);

            if (onProductAdded) {
                onProductAdded();
            }
        
            onClose();

        }
        catch(err){
            console.error("Error adding product: ", err);
        }
    };

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
                        {imageFile ? "Change Image" : "Upload Image"}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: "none" }}
                        />
                        </label>
                    </div>

                    {imageFile && (
                        <p className="add-service-upload-hint">
                        Selected: <strong>{imageFile.name}</strong>
                        </p>
                    )}

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