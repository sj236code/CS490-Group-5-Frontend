import React, { useState } from 'react';
import { Sparkle } from 'lucide-react';

function TypeCard({ type, imageUrl, onClick }) {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <div className="type-card" onClick={onClick}>
            <div className="type-card-image">
                {imageUrl && !imageError ? (
                    <img 
                        src={imageUrl} 
                        alt={type.name} 
                        onError={handleImageError}
                    />
                ) : (
                    <div className="type-card-placeholder">
                        <Sparkle size={40} />
                    </div>
                )}
            </div>
            
            <div className="type-card-content">
                <h3 className="type-card-name">{type.name}</h3>
            </div>
        </div>
    );
}

export default TypeCard;