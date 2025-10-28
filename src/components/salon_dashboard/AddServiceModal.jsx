import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { resumeAndPrerenderToNodeStream } from 'react-dom/static';

function AddServiceModal({ isOpen, onClose, salonId, onServiceAdded }) {

    const [formData, setFormData] = useState({
        serviceName: "",
        price: "",
        duration: "",
    });

    const [images, setImages] = useState([]);
    const [iconFile, setIconFile] = useState(null);


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

    const submitService = async(e) => {
        e.preventDefault();

        try{

            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.serviceName);
            formDataToSend.append('salon_id', salonId);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('duration', formData.duration);
            formDataToSend.append('is_active', 'true');

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salon_register/add_service`, { method: 'POST', body: formDataToSend,});

            const data = await response.json();

            if(!response.ok){
                throw new Error(data.error || 'Failed. ');
            }

            console.log('Service added successfully: ', data);

            setFormData({
                serviceName: "",
                price: "",
                duration: "",
            });

            if (onServiceAdded) {
                onServiceAdded();
            }
        
            onClose();

        }
        catch(err){
            console.error("Error adding service: ", err);
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
                                style={{display: 'none'}}
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