import { useState } from 'react';
import { X, Upload } from 'lucide-react';

function AddServiceModal({ isOpen, onClose, salonId, onServiceAdded }) {
  const [formData, setFormData] = useState({
    serviceName: "",
    price: "",
    duration: "",
  });

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
    if(!files || !files.length) return;
    setImageFile(files[0]);
  };

  const submitService = async (e) => {
    e.preventDefault();

    // Coerce and validate
    const numericSalonId = Number(salonId);
    const numericPrice = Number(formData.price);
    const numericDuration = Number(formData.duration);

    if (!numericSalonId || Number.isNaN(numericPrice) || Number.isNaN(numericDuration)) {
      console.error("Invalid numeric inputs: ", {
        salonId,
        numericSalonId,
        price: formData.price,
        duration: formData.duration,
      });
      alert("Please ensure salon, price, and duration are valid numbers.");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.serviceName.trim());
      formDataToSend.append("salon_id", numericSalonId.toString());
      formDataToSend.append("price", numericPrice.toString());
      formDataToSend.append("duration", numericDuration.toString());
      formDataToSend.append("is_active", "true");

      // Optional: send images if backend supports it
      if(imageFile){
        formDataToSend.append("icon_file", imageFile);
      }

      for (const [key, value] of formDataToSend.entries()){
        console.log("FormData entry: ", key, value);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/salon_register/add_service`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error("Add service failed response:", data);
        throw new Error(data.error || "Failed to add service.");
      }

      console.log("Service added successfully:", data);

      // Reset form + images
      setFormData({
        serviceName: "",
        price: "",
        duration: "",
      });
      setImageFile(null);

      // Refresh services in parent
      onServiceAdded?.();

      onClose();
    } catch (err) {
      console.error("Error adding service: ", err);
      alert(err.message || "Error adding service.");
    }
  };

  const handleBack = () => {
    setImageFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="add-service-modal-overlay" onClick={handleBack}>
      <div
        className="add-service-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="add-service-modal-header">
          <h2 className="add-service-header-title">Add a Service</h2>
          <button className="add-service-close-btn" onClick={handleBack}>
            <X size={24} />
          </button>
        </div>

        <hr className="add-service-divider" />

        {/* Form */}
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

          <div className="add-service-actions">
            <button type="button" onClick={handleBack} className="add-service-back-btn">Back</button>
            <button type="submit" className="add-service-submit-btn">Add Service</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddServiceModal;
