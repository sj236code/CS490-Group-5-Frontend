import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';

function EditProductModal({ isOpen, onClose, product, salonId, onProductUpdated }) {
  const [formData, setFormData] = useState({
    productName: "",
    price: "",
    quantity: "",
  });

  const [iconFile, setIconFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const imgSrc = product?.icon_url || product?.image_url;

  // Populate form when modal opens
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        productName: product.name || "",
        price: product.price || "",
        quantity: product.stock_qty != null ? String(product.stock_qty) : "",
      });
      setIconFile(null);
      setPreviewUrl(null);
      setShowDeleteConfirm(false);
    }
  }, [product, isOpen]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const submitProduct = async (e) => {
    e.preventDefault();

    try {
      let newImageUrl = null;

      // When user selected a new image, use add_product as a temp uploader
      if (iconFile) {
        const effectiveSalonId = salonId ?? product?.salon_id;

        if (!effectiveSalonId) {
          console.error("Missing salonId for temp product upload", {
            salonIdProp: salonId,
            productSalonId: product?.salon_id,
          });
          alert("Cannot upload image: missing salon id.");
          return;
        }

        const tempFormData = new FormData();
        const tmpName = `__tmp_image_${product.id}_${Date.now()}`;

        tempFormData.append("name", tmpName);
        tempFormData.append("salon_id", String(effectiveSalonId));
        tempFormData.append("price", "0");
        tempFormData.append("stock_qty", "0");
        tempFormData.append("is_active", "false");
        tempFormData.append("image_url", iconFile);

        const tmpRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/salon_register/add_product`,
          { method: "POST", body: tempFormData }
        );

        const tmpData = await tmpRes.json();

        if (!tmpRes.ok) {
          console.error("Temp upload failed:", tmpData);
          throw new Error(tmpData.error || "Image upload failed");
        }

        newImageUrl = tmpData?.product?.image_url || null;
        const tmpProductId = tmpData?.product?.id;

        // Best-effort delete of the temp product
        if (tmpProductId) {
          try {
            await fetch(
              `${import.meta.env.VITE_API_URL}/api/salon_register/delete_product/${tmpProductId}`,
              { method: "DELETE", headers: { Accept: "application/json" } }
            );
          } catch (delErr) {
            console.warn("Failed to delete temp product:", delErr);
          }
        }
      }

      // Now do the real update via JSON (what your update endpoint expects)
      const payload = {
        name: formData.productName,
        price: parseFloat(formData.price),
        stock_qty: parseInt(formData.quantity),
        salon_id: salonId ?? product?.salon_id,
      };

      if (newImageUrl) {
        payload.image_url = newImageUrl;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cart/update-product/${product.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Update product error payload:", data);
        throw new Error(data.error || "Failed to update product");
      }

      console.log("Product updated successfully:", data);

      onProductUpdated?.();
      onClose();
    } catch (err) {
      console.error("Error updating product:", err);
    }
  };

  const handleDeleteClick = () => setShowDeleteConfirm(true);

  const cancelDelete = () => setShowDeleteConfirm(false);

  const confirmDelete = async () => {
    if (!product?.id) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/salon_register/delete_product/${product.id}`,
        {
          method: "DELETE",
          headers: { Accept: "application/json" },
        }
      );

      const data = await res.json().catch(() => ({}));
      console.log("Product deleted: ", data);
      onProductUpdated?.();
      onClose();
    } catch (err) {
      console.error("Error deleting service: ", err);
    }

    setShowDeleteConfirm(false);
  };

  const handleBack = () => {
    setFormData({
      productName: "",
      price: "",
      duration: "",
    });
    setIconFile(null);
    setPreviewUrl(null);
    setShowDeleteConfirm(false);
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
          <h2 className="add-service-header-title">Edit Product</h2>
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
              alt={product?.name}
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
              Delete Product
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
              <h3>Delete product?</h3>
              <p>
                Are you sure you want to delete “{product?.name}”? This cannot
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

export default EditProductModal;
