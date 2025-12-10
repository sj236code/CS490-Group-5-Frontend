import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Star, Camera, StarHalf, StarOff } from 'lucide-react';
import DashboardManageTab from '../components/salon_dashboard/DashboardManageTab';
import DashboardLoyaltyTab from '../components/salon_dashboard/DashboardLoyaltyTab';
import DashboardCalendarTab from '../components/salon_dashboard/DashboardCalendarTab';
import DashboardMetricsTab from '../components/salon_dashboard/DashboardMetricsTab';
import DashboardEmployeesTab from '../components/salon_dashboard/DashboardEmployeesTab';
import ImageCropModal from '../components/layout/ImageCropModal';

function SalonDashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams(); 
    const { salon, user } = location.state || {};

    const [workingTab, setWorkingTab] = useState("Metrics");
    const [salonDetails, setSalonDetails] = useState(null);
    const [heroImage, setHeroImage] = useState(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [showCropModal, setShowCropModal] = useState(false);
    const [tempImageUrl, setTempImageUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    // Dashboard is always for owners, so isOwner is always true
    const isOwner = true;

    useEffect(() => {
        const salonId = searchParams.get('id');

        if (salonId) {
            // Fetch using ID from query param
            fetch(`${import.meta.env.VITE_API_URL}/api/salons/details/${salonId}`)
                .then(res => res.json())
                .then(data => {
                    setSalonDetails(data);
                    fetchHeroImage(salonId);
                })
                .catch(err => console.error(err));
        } 
        else if (salon) {
            // Use salon from location.state
            if (salon.id && !salon.name) {
                fetch(`${import.meta.env.VITE_API_URL}/api/salons/details/${salon.id}`)
                    .then(res => res.json())
                    .then(data => {
                        setSalonDetails(data);
                        fetchHeroImage(salon.id);
                    })
                    .catch(err => console.error(err));
            } else {
                setSalonDetails(salon);
                fetchHeroImage(salon.id);
            }
            console.log("Salon Details:", salon);
        } 
        else {
            console.error("No salon data provided.");
        }
    }, [location, searchParams]);

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

    useEffect(() => {
        if (workingTab === "Shop" && salonDetails?.id) {
            // fetchServices(); // only if this function is defined elsewhere
        }
    }, [workingTab, salonDetails]);

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

    return (
        <div>
            {showCropModal && (
                <ImageCropModal
                    imageUrl={tempImageUrl}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}

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

            <div className="salon-details-header">
                <h1 className="salon-details-name">{salonDetails.name}</h1>
                <div className="salon-details-info">
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

            <div className="salon-details-tabs">
                {["Metrics", "Calendar", "Manage", "Loyalty", "Employees"].map(tab => (
                    <button
                        key={tab}
                        className="salon-detail-tab-link"
                        onClick={() => setWorkingTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="salon-details-tab-content">
                {workingTab === "Metrics" && <DashboardMetricsTab salon={salonDetails} user={user}/>}
                {workingTab === "Calendar" && <DashboardCalendarTab salon={salonDetails} user={user}/>}
                {workingTab === "Loyalty" && <DashboardLoyaltyTab salon={salonDetails} />}
                {workingTab === "Manage" && <DashboardManageTab salon={salonDetails} />}
                {workingTab === "Employees" && <DashboardEmployeesTab salon={salonDetails} user={user} />}
            </div>
        </div>
    );
}

export default SalonDashboard;