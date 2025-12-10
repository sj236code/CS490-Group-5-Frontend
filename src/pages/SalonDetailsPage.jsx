import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Star, StarHalf, StarOff, Camera } from "lucide-react";
import SalonShopTab from '../components/salon_details/SalonShopTab';
import GalleryTab from '../components/salon_details/GalleryTab';
import ReviewsTab from '../components/salon_details/ReviewsTab';
import AboutTab from '../components/salon_details/AboutTab';
import ImageCropModal from '../components/layout/ImageCropModal';

const StarRating = ({ rating }) => {
    const totalStars = 5;

    return (
        <div className="star-rating-display" style={{ display: "flex", gap: "2px" }}>
            {[...Array(totalStars)].map((_, i) => {
                const starIndex = i + 1;

                if (rating >= starIndex) {
                // full star
                return <Star key={i} size={16} fill="#4B5945" color="#4B5945" />;
                }

                if (rating >= starIndex - 0.5) {
                // half star
                return <StarHalf key={i} size={16} fill="#4B5945" color="#4B5945" />;
                }

                // empty star
                return <StarOff key={i} size={16} fill="#E0E0E0" color="#E0E0E0" />;
            })}
        </div>
    );
};

function SalonDetailsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { salon, userType, user } = location.state || {};

    const [salonDetails, setSalonDetails] = useState(salon);
    const [workingTab, setWorkingTab] = useState("About");
    const [services, setServices] = useState([]);
    const [heroImage, setHeroImage] = useState(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [showCropModal, setShowCropModal] = useState(false);
    const [tempImageUrl, setTempImageUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const customerId = user?.profile_id ?? '-';
    const userRole = user?.role ?? '-';

    // Check if current user is the salon owner (compare profile_id with salon_owner_id)
    // Note: We need salon_owner_id from salonDetails to properly check ownership
    const isOwner = user && salonDetails && user.profile_id === salonDetails.salon_owner_id;

    console.log("SALONDETAILS: CUSTOMER ID: ", customerId);
    console.log("SALONDETAILS USERTYPE: ", userRole);

    // Do I have to handle possible error if no valid salon is passed?
    useEffect(() => {
        if (!salon){
            console.error("No Salon Data provided.");
        }
        else{
            setSalonDetails(salon);
            fetchHeroImage(salon.id);
            console.log("Salon Details: ", salon);
        }
    }, [salon]);

    const fetchHeroImage = async (salonId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salon_images/get_salon_home_image/${salonId}`);
            const data = await response.json();
            if (data.has_image) {
                setHeroImage(data.image_url);
            }
        } catch (err) {
            console.error("Failed to fetch hero image:", err);
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 10MB for original, will be compressed after crop)
        if (file.size > 10 * 1024 * 1024) {
            alert('Image size must be less than 10MB');
            return;
        }

        // Create temporary URL for cropping
        const imageUrl = URL.createObjectURL(file);
        setTempImageUrl(imageUrl);
        setSelectedFile(file);
        setShowCropModal(true);
    };

    const handleCropComplete = async (croppedBlob) => {
        setShowCropModal(false);
        setIsUploadingImage(true);

        // Clean up temp URL
        if (tempImageUrl) {
            URL.revokeObjectURL(tempImageUrl);
        }

        const formData = new FormData();
        formData.append('image', croppedBlob, selectedFile.name);
        formData.append('salon_id', salonDetails.id);
        formData.append('user_id', user.profile_id);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salon_images/upload_salon_home_image`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setHeroImage(data.image_url);
                alert('Hero image updated successfully!');
            } else {
                alert(data.error || 'Failed to upload image');
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Failed to upload image. Please try again.');
        } finally {
            setIsUploadingImage(false);
            setTempImageUrl(null);
            setSelectedFile(null);
        }
    };

    const handleCropCancel = () => {
        setShowCropModal(false);
        if (tempImageUrl) {
            URL.revokeObjectURL(tempImageUrl);
        }
        setTempImageUrl(null);
        setSelectedFile(null);
    };

    // Add check for salonDetails
    if (!salonDetails) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <p style={{ color: 'red' }}>No salon data found</p>
                <button onClick={() => navigate('/search')}>
                    Return to Search
                </button>
            </div>
        );
    }

    useEffect(() => {
        if (workingTab === "Shop" && salonDetails?.id){
            fetchServices();
        }
    }, [workingTab, salonDetails]);

    const fetchServices = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salons/details/${salonDetails.id}/services`);
            const data = await response.json();

            setServices(data.services || []);
        }
        catch (error) {
            console.error("Failed to fetch services.", error);
        }
    };

    const addToCart = (service) => {
        console.log("Added to cart:", service);
    }

    return (
        <div>
            {showCropModal && (
                <ImageCropModal
                    imageUrl={tempImageUrl}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}

            {/* Hero */}
            <div 
                className="salon-details-hero"
                style={heroImage ? { backgroundImage: `url(${heroImage})` } : {}}
            >
                <div className="salon-hero-overlay"></div>
                
                {isOwner && (
                    <button 
                        className="hero-image-upload-btn"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                    >
                        <Camera size={20} />
                        {isUploadingImage ? 'Uploading...' : 'Change Photo'}
                    </button>
                )}
                
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                />
            </div>

            {/* Salon Info */}
            <div className="salon-details-header">
                <h1 className="salon-details-name">{salonDetails.title}</h1>
                <div className="salon-details-info">
                    <span className="salon-type-badge">{salonDetails.type}</span>
                    <div className="salon-rating-section">
                        {(() => {
                            const avgRating = salonDetails.avgRating ?? salonDetails.avg_rating ?? 0;

                            const totalReviews = salonDetails.totalReviews ?? salonDetails.total_reviews ?? 0;

                            return (
                            <>
                                <span className="rating-number">
                                    {avgRating ? avgRating.toFixed(1) : 'N/A'}
                                </span>
                                <StarRating rating={avgRating || 0} />
                                <span className="review-text">
                                    ({totalReviews} Reviews)
                                </span>
                            </>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Nvigation Tabs */}
            <div className="salon-details-tabs">
                <button className="salon-detail-tab-link" onClick={() => setWorkingTab('About')}>About</button>
                <button className="salon-detail-tab-link" onClick={() => setWorkingTab('Gallery')}>Gallery</button>
                <button className="salon-detail-tab-link" onClick={() => setWorkingTab('Reviews')}>Reviews</button>
                <button className="salon-detail-tab-link" onClick={() => setWorkingTab('Shop')}>Shop</button>
            </div>

            {/* Tab Content */}
            <div className="salon-details-tab-content">
                {workingTab =="About" && (
                    <div>
                        {/* <h2>About Page for: {salonDetails.title}</h2> */}
                        <AboutTab salon={salonDetails} />
                    </div>
                )}
                {workingTab =="Gallery" && (
                    <div>
                        {/* <h2>Gallery Page for: {salonDetails.title}</h2> */}
                        <GalleryTab salon={salonDetails} />
                    </div>
                )}
                {workingTab =="Reviews" && (
                    <div>
                        {/* <h2>Reviews Page for: {salonDetails.title}</h2> */}
                        <ReviewsTab salon={salonDetails} user={user} />
                    </div>
                )}
                {workingTab =="Shop" && (
                    <div>
                        <SalonShopTab salon={salonDetails} userType={userType} user={user}/>
                    </div>
                )}
            </div>

        </div>
    );
}

export default SalonDetailsPage;
