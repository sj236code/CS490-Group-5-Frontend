import { useState, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './ImageCropModal.css';

function ImageCropModal({ imageUrl, onCropComplete, onCancel }) {
    const [crop, setCrop] = useState({
        unit: '%',
        x: 5,
        y: 10,
        width: 90,
        height: 33.75,
        aspect: 16 / 6, // Wide aspect ratio for hero images
    });
    const [completedCrop, setCompletedCrop] = useState(null);
    const imgRef = useRef(null);

    const getCroppedImg = () => {
        const image = imgRef.current;
        if (!image || !completedCrop) return null;

        let { x, y, width, height, unit } = completedCrop;

        const naturalWidth = image.naturalWidth;
        const naturalHeight = image.naturalHeight;

        if (unit === '%') {
            x = (x / 100) * naturalWidth;
            y = (y / 100) * naturalHeight;
            width = (width / 100) * naturalWidth;
            height = (height / 100) * naturalHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        ctx.drawImage(image,x,y,width,height,0,0,width,height);

        return new Promise((resolve) => {
            canvas.toBlob(
            (blob) => resolve(blob),
            'image/jpeg',
            0.95
            );
        });
    };


    const handleSave = async () => {
        if (!completedCrop || !completedCrop.width || !completedCrop.height) {
            alert('Please select a crop area');
            return;
        }

        const croppedBlob = await getCroppedImg();
        if (!croppedBlob) {
            alert('Failed to crop image, please try again.');
            return;
        }

        onCropComplete(croppedBlob);
    };

    return (
        <div className="crop-modal-overlay">
            <div className="crop-modal-content">
                <h2>Crop Your Image</h2>
                <p className="crop-instructions">
                    Drag to adjust the crop area. The image will be used as your salon's hero banner.
                </p>
                
                <div className="crop-container">
                    <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={16 / 6}
                    >
                        <img
                            ref={imgRef}
                            src={imageUrl}
                            alt="Crop preview"
                            style={{ maxWidth: '100%', maxHeight: '60vh' }}
                        />
                    </ReactCrop>
                </div>

                <div className="crop-modal-buttons">
                    <button className="btn-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="btn-save" onClick={handleSave}>
                        Save & Upload
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ImageCropModal;