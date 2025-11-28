// src/components/common/GallerySelector.jsx
import { useState, useEffect } from "react";
import { CheckCircle2, Image, Loader2 } from "lucide-react";
import "../../App.css"; // Assuming App.css contains your styles

function GallerySelector({ customerId, selectedImageIds, onSelectionChange }) {
    const API_BASE = import.meta.env.VITE_API_URL;
    const [galleryImages, setGalleryImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch current gallery on mount / when customerId changes
    useEffect(() => {
        const fetchGallery = async () => {
            if (!customerId) return;

            setIsLoading(true);
            setError("");

            try {
                const response = await fetch(`${API_BASE}/api/user_gallery/gallery/${customerId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to load gallery.");
                }

                setGalleryImages(data.gallery || []);
            } catch (err) {
                console.error("Error fetching gallery: ", err);
                setError(err.message || "Something went wrong loading your gallery.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchGallery();
    }, [customerId, API_BASE]);

    const handleImageToggle = (imageId) => {
        let newSelection;
        if (selectedImageIds.includes(imageId)) {
            // Deselect
            newSelection = selectedImageIds.filter((id) => id !== imageId);
        } else {
            // Select
            newSelection = [...selectedImageIds, imageId];
        }
        onSelectionChange(newSelection);
    };

    if (!customerId) {
        return <p className="gallery-status-text">Log in to view and select your gallery images.</p>;
    }

    if (isLoading) {
        return (
            <div className="gallery-status-text loading-indicator">
                <Loader2 className="animate-spin" size={20} /> Loading your gallery...
            </div>
        );
    }

    if (error) {
        return <div className="gallery-error-banner">{error}</div>;
    }

    return (
        <div className="gallery-selector-container">
            <h3 className="book-appt-subtitle">Attach Inspiration Photos</h3>
            <p className="gallery-selector-hint">Select images from your gallery to share with your stylist.</p>

            <div className="gallery-grid gallery-selector-grid">
                {galleryImages.length === 0 ? (
                    <div className="gallery-empty-text-selector">
                        <Image size={24} style={{ marginBottom: '8px' }} />
                        <p>No images in your gallery.</p>
                        <p className="gallery-selector-hint">Visit the Gallery page to upload some!</p>
                    </div>
                ) : (
                    galleryImages.map((img) => {
                        const isSelected = selectedImageIds.includes(img.id);
                        return (
                            <div 
                                key={img.id} 
                                className={`gallery-thumb gallery-selector-thumb ${isSelected ? "gallery-thumb-selected" : ""}`}
                                onClick={() => handleImageToggle(img.id)}
                                title={isSelected ? "Deselect" : "Select"}
                            >
                                <img
                                    src={img.url}
                                    alt="Gallery image"
                                    className="gallery-thumb-img"
                                />
                                {isSelected && (
                                    <div className="gallery-selector-check">
                                        <CheckCircle2 size={24} />
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default GallerySelector;