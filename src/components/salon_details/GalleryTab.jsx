import { useState, useEffect } from 'react';
import LightGallery from 'lightgallery/react';

// Import lightGallery plugins
import lgZoom from 'lightgallery/plugins/zoom';
import lgHash from 'lightgallery/plugins/hash';

// Import Masonry
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';

// Import lightGallery styles
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';

// Import our custom styles
import './GalleryTab.css';

function GalleryTab({ salon }) {
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- 1. Fetch Images ---
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
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salon_images/get_images/${salon.id}`);
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                console.log(data);
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

    // --- 2. Initialize Masonry ---
    // This effect runs *after* the component renders and whenever 'images' changes
    useEffect(() => {
        if (images.length > 0) {
            const container = document.querySelector('.masonry-gallery');
            if (container) {
                // Initialize Masonry
                const msnry = new Masonry(container, {
                    itemSelector: '.gallery-item',
                    columnWidth: '.grid-sizer', // Use the sizer element
                    percentPosition: true,
                    gutter: 10 // Add some space between items
                });

                // Use imagesLoaded to layout Masonry after images load
                imagesLoaded(container).on('progress', function () {
                    msnry.layout();
                });
            }
        }
    }, [images]); // Dependency: run this when 'images' array is populated

    // --- 3. Render Logic ---
    if (isLoading) {
        return <div>Loading gallery...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    if (images.length === 0) {
        return <div>No gallery images have been uploaded yet.</div>;
    }

    return (
        <div className="gallery-container">
            <LightGallery
                elementClassNames="masonry-gallery" // This is the container Masonry will target
                plugins={[lgZoom, lgHash]}
                speed={500}
                download={false} // Disable download button for a cleaner look
            >
                {/* This empty div is what Masonry uses to calculate column width */}
                <div className="grid-sizer"></div>

                {images.map((image) => (
                    <a
                        key={image.id}
                        className="gallery-item"
                        data-src={image.url} // URL for the full-size lightbox image
                        data-sub-html={`<h4>Salon Gallery</h4><p>Uploaded on ${new Date(image.created_at).toLocaleDateString()}</p>`}
                    >
                        <img
                            src={image.url} // URL for the thumbnail image
                            alt="Salon gallery item"
                            className="img-responsive"
                        />
                    </a>
                ))}
            </LightGallery>
        </div>
    );
}

export default GalleryTab;