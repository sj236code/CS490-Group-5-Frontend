import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';

function EditServiceModal({ isOpen, onClose, service, onServiceUpdated }) {

    const [formData, setFormData] = useState({
        serviceName: "",
        price: "",
        duration: "",
    });

    const [iconFile, setIconFile] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Populate form with existing service data when modal opens
    useEffect(() => {
        if (service && isOpen) {
            setFormData({
                serviceName: service.name || "",
                price: service.price || "",
                duration: service.duration || "",
            });
            setIconFile(null);
        }
    }, [service, isOpen]);

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

    const submitService = async (e) => {
        e.preventDefault();

        try {
            // Create FormData object to match backend expectations
            const formDataToSend = new FormData();
            formDataToSend.append('service_id', service.id);
            formDataToSend.append('name', formData.serviceName);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('duration', formData.duration);
            formDataToSend.append('is_active', 'true');
            
            // Add the icon file if a new one was selected
            if (iconFile) {
                formDataToSend.append('icon_file', iconFile);
            }

            // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salon_register/update_service`, {
            //     method: 'PUT',
            //     body: formDataToSend,
            // });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update service');
            }

            console.log('Service updated successfully:', data);

            // Refresh
            if (onServiceUpdated) {
                onServiceUpdated();
            }
            
            onClose();

        } 
        catch (err) {
            console.error("Error updating service:", err);
        }
    };

    // Reset form and close
    const handleBack = () => {
        setFormData({
            serviceName: "",
            price: "",
            duration: "",
        });
        setIconFile(null);
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
                    <h2 className="add-service-header-title">Edit Service</h2>
                    <button className="add-service-close-btn" onClick={handleBack}>
                        <X size={24} />
                    </button>
                </div>

                <hr className="add-service-divider" />

                {/* Current Icon Preview */}
                {service?.icon_url && !iconFile && (
                    <div style={{ marginBottom: '15px', textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Current Image:</p>
                        <img 
                            src={service.icon_url} 
                            alt={service.name}
                            style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '8px' }}
                        />
                    </div>
                )}

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
                        <button 
                            type="button" 
                            onClick={handleBack} 
                            className="add-service-back-btn"
                        >
                            Back
                        </button>
                        <button 
                            type="submit" 
                            className="add-service-submit-btn"
                        > Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditServiceModal;