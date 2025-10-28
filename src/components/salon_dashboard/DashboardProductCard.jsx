// Modeled after ServiceCard used in LandingPage
// Made to show salon-specific details like price & rating
import { useState, useEffect } from 'react';
import {Star, Sparkle, ChevronLeft, ChevronRight, Rows4} from 'lucide-react';

function DashboardProductCard({product, onClick}) {

    const [imageError, setImageError] = useState(false);
    const rating = product.rating || product.avgRating || 4;
    
    // Calculate filled and empty stars
    const filledStars = Math.floor(rating); // Full stars- round down half stars
    const hasHalfStar = rating % 1 >= 0.5; // calc half star
    const emptyStars = 5 - filledStars - (hasHalfStar ? 1 : 0); // empty stars

    // Calculate stars based on salon rating
    const calcStars = () => {
        const stars = [];
        
        // Add filled stars
        for (let i = 0; i < filledStars; i++) {
            stars.push(
                <Star 
                    key={`filled-${i}`} 
                    size={12} 
                    fill="#4B5945" 
                    color="#4B5945" 
                />
            );
        }
        
        // Empty Star
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <Star 
                    key={`empty-${i}`} 
                    size={12} 
                    fill="none" 
                    color="#E5E7EB" 
                />
            );
        }

        return stars;
    };

    const handleImageError = () => {
        setImageError(true);
    }

    return(
        <div className="salon-service-card" onClick={onClick}>

            <div className="salon-service-image">
               
                {product.icon_url && !imageError ? (
                    <img 
                        src={product.icon_url} 
                        alt={product.name}
                        onError={handleImageError}
                    />
                ) : (
                    <div className="salon-service-placeholder">
                        <span><Sparkle /></span>
                    </div>
                )}

                {/* <div className="salon-service-placeholder">
                    <span><Sparkle /></span>
                </div> */}
            </div>

            {/* Service Name */}
            <h3 className="salon-service-name">{product.name}</h3>

            {/* Rating */}
            <div className="salon-service-rating">
                {calcStars()}
            </div>

            {/* Price and Book Button */}
            <div className="salon-service-footer">
                <span className="salon-service-price">
                    ${product.price ? product.price.toFixed(2) : '0.00'}
                </span>
            </div>
        </div>
    );

}

export default DashboardProductCard;