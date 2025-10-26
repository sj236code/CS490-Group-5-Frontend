import { useState } from 'react';
import { X, Upload } from 'lucide-react';

function AddServiceModal({ isOpen, onClose, salonId, onServiceAdded }) {

    const [formData, setFormData] = useState({
        serviceName: "",
        price: "",
        duration: "",
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

    const submitService = (e) => {
        e.preventDefault();

        const newService = {
            id: salonId,
            name: formData.serviceName,
            price: parseFloat(formData.price),
            duration: parseInt(formData.duration),
            images: images.map((img) => URL.createObjectURL(img)),
        };

        console.log('New service:', newService);

        setFormData({
            serviceName: "",
            price: "",
            duration: "",
        });

        // Reset form
        setImages([]);

        if (onServiceAdded) {
            onServiceAdded();
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
                    <h2 className="add-service-header-title">Add a Service</h2>
                    <button className="add-service-close-btn" onClick={handleBack}>
                        <X size={24} />
                    </button>
                </div>

                <hr className="add-service-divider" />

                {/* Form with Details */}
                <form onSubmit={submitService} className="add-service-form">
                    <label className="add-service-label">Service:</label>
                    
                    <input
                        type="text"
                        name="serviceName"
                        placeholder="Service Name"
                        value={formData.serviceName}
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
                            name="duration"
                            placeholder="Duration (minutes)"
                            value={formData.duration}
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
                            Add Service
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddServiceModal;