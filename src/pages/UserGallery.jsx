import { useState, useEffect, useRef } from "react";
import { UploadCloud, CheckCircle2, Trash2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import "../App.css";

function UserGallery() {
  const location = useLocation();
  const userFromState = location.state?.user || null;
  const userIdFromState = location.state?.userId || null;
  const user = userFromState;

  const customerId = user?.profile_id ?? userIdFromState ?? null;

  const [galleryImages, setGalleryImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Fetch current gallery on mount / when customerId changes
  useEffect(() => {
    const fetchGallery = async () => {
      if (!customerId) return;

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user_gallery/gallery/${customerId}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load gallery.");
        }

        // data.gallery is an array of { id, url, created_at }
        setGalleryImages(data.gallery || []);

        console.log("Loading in images: ", data.gallery);
      } catch (err) {
        console.error("Error fetching gallery: ", err);
        setError(err.message || "Something went wrong loading your gallery.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGallery();
  }, [customerId]);

  const handleChooseFilesClick = () => {
    if (!customerId) {
      setError("You need to be logged in as a customer to upload images.");
      return;
    }

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !customerId) return;

    setError("");
    setIsUploading(true);

    try {
      // Upload each file one by one (similar to submitProduct style)
      for (const file of files) {
        const formDataToSend = new FormData();
        formDataToSend.append("customer_id", customerId);
        formDataToSend.append("image_file", file);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/user_gallery/upload_image`,
          {
            method: "POST",
            body: formDataToSend,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to upload image.");
        }

        // data.image = { id, customer_id, url, created_at }
        if (data.image) {
          // Put newest at the front
          setGalleryImages((prev) => [data.image, ...prev]);
        }

        console.log("Uploading: ", data.image);
      }
    } 
    catch (err) {
      console.error("Error uploading images: ", err);
      setError(err.message || "Something went wrong uploading your images.");
    } 
    finally {
      setIsUploading(false);
      // Clear input so user can re-select same file if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteImage = async (imageId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image from your gallery?"
    );
    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user_gallery/image/${imageId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete image.");
      }

      // Remove from state
      setGalleryImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      console.error("Error deleting image: ", err);
      setError(err.message || "Something went wrong deleting the image.");
    }
  };

  return (
    <div className="gallery-page">
      {/* Page Header */}
      <header className="gallery-header">
        <h1>My Inspiration Gallery</h1>
        <p className="gallery-subtitle">
          Upload reference images like hairstyles, colors, or nail designs to
          share with salon staff during your appointments.
        </p>
      </header>

      {/* Error / Status */}
      {error && <div className="gallery-error-banner">{error}</div>}
      {isLoading && (
        <div className="gallery-status-text">Loading gallery...</div>
      )}

      {/* Upload Card */}
      <section className="upload-section">
        <div className="upload-card">
          <div className="upload-inner" onClick={handleChooseFilesClick}>
            <div className="upload-icon">
              <UploadCloud size={40} />
            </div>
            <p className="upload-text-main">
              {isUploading ? "Uploading images..." : "Drag and drop images here"}
            </p>
            <p className="upload-text-sub">
              {isUploading
                ? "Please wait while we save your images"
                : "or click to browse your files"}
            </p>

            <button
              type="button"
              className="upload-choose-btn"
              onClick={handleChooseFilesClick}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Choose Files"}
            </button>

            <p className="upload-helper-text">
              Supported formats: JPG, PNG • Max size: 5MB per image
            </p>

            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFilesSelected}
            />
          </div>
        </div>
      </section>

      {/* Gallery Row Heading */}
      <section className="gallery-section">
        <div className="gallery-top-row">
          <p className="gallery-title-left">
            Your Gallery ({galleryImages.length})
          </p>
          <p className="gallery-title-right">
            Select images when booking appointments to share your style
            preferences
          </p>
        </div>

        {/* Thumbnails */}
        <div className="gallery-grid">
          {galleryImages.length === 0 && !isLoading && (
            <p className="gallery-empty-text">
              You don&apos;t have any images yet. Upload some inspiration to get
              started.
            </p>
          )}

          {galleryImages.map((img) => (
            <div key={img.id} className="gallery-thumb">
              <img
                src={img.url}
                alt={img.alt || "Gallery image"}
                className="gallery-thumb-img"
              />
              <button
                type="button"
                className="gallery-delete-btn"
                onClick={() => handleDeleteImage(img.id)}
                title="Delete image"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Info Card */}
      <section className="gallery-info-section">
        <div className="gallery-info-card">
          <div className="gallery-info-header">
            <CheckCircle2 className="gallery-info-icon" size={20} />
            <span className="gallery-info-title">How to use your gallery</span>
          </div>
          <ul className="gallery-info-list">
            <li>
              Upload hairstyle inspirations, color references, or design ideas
            </li>
            <li>
              When booking an appointment, select images to share with your
              stylist
            </li>
            <li>Images help ensure you and your stylist are on the same page</li>
            <li>
              Your gallery is private and only visible to salons during your
              appointments
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export default UserGallery;
