import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';

function EditServiceModal({ isOpen, onClose, service, salonId, onServiceUpdated }) {
  const [formData, setFormData] = useState({
    serviceName: "",
    price: "",
    duration: "",
  });

  const [iconFile, setIconFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const imgSrc = service?.icon_url || null;

  // Populate form with existing service data when modal opens
  useEffect(() => {
    if (service && isOpen) {
      setFormData({
        serviceName: service.name || "",
        price: service.price || "",
        duration: service.duration || "",
      });
      setIconFile(null);
      setPreviewUrl(null);
      setShowDeleteConfirm(false);
    }
  }, [service, isOpen]);

  // Cleanup preview URL on unmount / change
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const objectURL = URL.createObjectURL(file);
      setPreviewUrl(objectURL);
    }
  };

  const submitService = async (e) => {
    e.preventDefault();

    try {
      let newIconUrl = null;

      // If user selected a new image, use add_service as a temp uploader
      if (iconFile) {
        const effectiveSalonId = salonId ?? service?.salon_id;

        if (!effectiveSalonId) {
          console.error("Missing salon_id for temp service upload", {
            serviceSalonId: service?.salon_id,
          });
          alert("Cannot upload image: missing salon id.");
          return;
        }

        const tempFormData = new FormData();
        const tmpName = `__tmp_service_image_${service.id}_${Date.now()}`;

        tempFormData.append("name", tmpName);
        tempFormData.append("salon_id", String(effectiveSalonId));
        tempFormData.append("price", "0");
        tempFormData.append("duration", "0");
        tempFormData.append("is_active", "false");
        tempFormData.append("icon_file", iconFile); // field name expected by add_service

        const tmpRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/salon_register/add_service`,
          { method: "POST", body: tempFormData }
        );

        const tmpData = await tmpRes.json();

        if (!tmpRes.ok) {
          console.error("Temp service upload failed:", tmpData);
          throw new Error(tmpData.error || "Image upload failed");
        }

        newIconUrl = tmpData?.service?.icon_url || null;
        const tmpServiceId = tmpData?.service?.id;

        // Best-effort delete of the temp service
        if (tmpServiceId) {
          try {
            await fetch(
              `${import.meta.env.VITE_API_URL}/api/salon_register/delete_service/${tmpServiceId}`,
              { method: "DELETE", headers: { Accept: "application/json" } }
            );
          } catch (delErr) {
            console.warn("Failed to delete temp service:", delErr);
          }
        }
      }

      // Real update via JSON (what update-service endpoint expects)
      const payload = {
        name: formData.serviceName,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration, 10),
        salon_id: service.salon_id,
      };

      if (newIconUrl) {
        payload.icon_url = newIconUrl;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cart/update-service/${service.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Update service error payload:", data);
        throw new Error(data.error || "Failed to update service");
      }

      console.log("Service updated successfully:", data);

      onServiceUpdated?.();
      onClose();
    } catch (err) {
      console.error("Error updating service:", err);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const confirmDelete = async () => {
    if (!service?.id) {
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/salon_register/delete_service/${service.id}`,
        {
          method: "DELETE",
          headers: { Accept: "application/json" },
        }
      );

      const data = await res.json().catch(() => ({}));

      console.log("Service deleted: ", data);
      onServiceUpdated?.();
      onClose();
    } catch (err) {
      console.error("Error deleting service: ", err);
    }

    setShowDeleteConfirm(false);
  };

  // Reset form and close
  const handleBack = () => {
    setFormData({
      serviceName: "",
      price: "",
      duration: "",
    });
    setIconFile(null);
    setPreviewUrl(null);
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="add-service-modal-overlay" onClick={handleBack}>
      <div
        className="add-service-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="add-service-modal-header">
          <h2 className="add-service-header-title">Edit Service</h2>
          <button className="add-service-close-btn" onClick={handleBack}>
            <X size={24} />
          </button>
        </div>

        <hr className="add-service-divider" />

        {/* Current Icon Preview */}
        {imgSrc && !iconFile && (
          <div style={{ marginBottom: "15px", textAlign: "center" }}>
            <p
              style={{
                fontSize: "12px",
                color: "#666",
                marginBottom: "5px",
              }}
            >
              Current Image:
            </p>
            <img
              src={imgSrc}
              alt={service?.name}
              style={{
                maxWidth: "100px",
                maxHeight: "100px",
                borderRadius: "8px",
              }}
            />
          </div>
        )}

        {/* New Icon Preview */}
        {iconFile && previewUrl && (
          <div style={{ marginBottom: "15px", textAlign: "center" }}>
            <p
              style={{
                fontSize: "12px",
                color: "#666",
                marginBottom: "5px",
              }}
            >
              New Image Preview:
            </p>
            <img
              src={previewUrl}
              alt={iconFile.name}
              style={{
                maxWidth: "100px",
                maxHeight: "100px",
                borderRadius: "8px",
              }}
            />
            <p
              style={{
                fontSize: "11px",
                color: "#555",
                marginTop: "4px",
              }}
            >
              {iconFile.name}
            </p>
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
              {iconFile ? iconFile.name : "Change Image"}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
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
              type="button"
              onClick={handleDeleteClick}
              className="add-service-delete-btn"
            >
              Delete Service
            </button>
            <button type="submit" className="add-service-submit-btn">
              Save Changes
            </button>
          </div>
        </form>

        {/* Delete Modal */}
        {showDeleteConfirm && (
          <div className="add-service-modal-overlay" onClick={cancelDelete}>
            <div
              className="add-service-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Delete service?</h3>
              <p>
                Are you sure you want to delete “{service?.name}”? This cannot
                be undone.
              </p>
              <div className="add-service-actions">
                <button
                  onClick={cancelDelete}
                  className="add-service-back-btn"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="add-service-delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditServiceModal;
