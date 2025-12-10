import { useState, useEffect } from 'react';
import LightGallery from 'lightgallery/react';
import lgZoom from 'lightgallery/plugins/zoom';
import lgHash from 'lightgallery/plugins/hash';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import './GalleryTab.css';

function GalleryTab({ salon }) {
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch Images from review-gallery endpoint
    useEffect(() => {
        if (!salon?.id) {
            setError("No salon ID provided.");
            setIsLoading(false);
            return;
        }

        const fetchImages = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salons/details/${salon.id}/review-gallery`);
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                setImages(data.gallery || []);

            } catch (err) {
                console.error("Failed to fetch gallery images:", err);
                setError("Failed to load gallery. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchImages();
    }, [salon.id]);

    // Render Logic
    if (isLoading) {
        return <div>Loading gallery...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    if (images.length === 0) {
        return (
            <div className="no-images">
                No Images Have been Uploaded For This Salon
            </div>
        );
    }

    return (
        <div className="gallery-container">
            <LightGallery
                elementClassNames="gallery-grid"
                plugins={[lgZoom, lgHash]}
                speed={500}
                download={false}
            >
                {images.map((image) => (
                    <a
                        key={image.id}
                        className="gallery-item"
                        data-src={image.url}
                        data-sub-html={`<h4>${image.customer_name}</h4><p>Rating: ${image.rating ? '⭐'.repeat(Math.round(image.rating)) : 'N/A'}</p><p>Uploaded on ${new Date(image.created_at).toLocaleDateString()}</p>`}
                    >
                        <img
                            src={image.url}
                            alt={`Review by ${image.customer_name}`}
                            className="img-responsive"
                        />
                    </a>
                ))}
            </LightGallery>
        </div>
    );
}

export default GalleryTab;