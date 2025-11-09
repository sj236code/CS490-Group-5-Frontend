import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import "../App.css";

const UserGallery = () => {
  // Later replace this with data from endpoint
  const [galleryImages, setGalleryImages] = useState([
    {
      id: 1,
      url: "https://images.pexels.com/photos/2706379/pexels-photo-2706379.jpeg",
      alt: "Salon inspiration 1",
    },
    {
      id: 2,
      url: "https://images.pexels.com/photos/206867/pexels-photo-206867.jpeg",
      alt: "Salon inspiration 2",
    },
    {
      id: 3,
      url: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
      alt: "Salon inspiration 3",
    },
  ]);

  const fileInputRef = useRef(null);

  const handleChooseFilesClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFilesSelected = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    // For now, just show previews. Later you can upload to your backend here.
    const newImages = files.map((file, index) => ({
      id: Date.now() + index,
      url: URL.createObjectURL(file),
      alt: file.name,
      file, // keep the File object if you want to send it to an API
    }));

    setGalleryImages((prev) => [...prev, ...newImages]);
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

      {/* Upload Card */}
      <section className="upload-section">
        <div className="upload-card">
          <div className="upload-inner" onClick={handleChooseFilesClick}>
            <div className="upload-icon"><UploadCloud size={40} /></div>
            <p className="upload-text-main">Drag and drop images here</p>
            <p className="upload-text-sub">or click to browse your files</p>

            <button type="button" className="upload-choose-btn" onClick={handleChooseFilesClick}>Choose Files</button>

            <p className="upload-helper-text">Supported formats: JPG, PNG • Max size: 5MB per image</p>

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
          <p className="gallery-title-left">Your Gallery ({galleryImages.length})</p>
          <p className="gallery-title-right">Select images when booking appointments to share your style preferences</p>
        </div>

        {/* Thumbnails */}
        <div className="gallery-grid">
          {galleryImages.map((img) => (
            <div key={img.id} className="gallery-thumb">
              <img src={img.url} alt={img.alt} className="gallery-thumb-img"/>
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
            <li>Upload hairstyle inspirations, color references, or design ideas</li>
            <li>When booking an appointment, select images to share with your stylist</li>
            <li>Images help ensure you and your stylist are on the same page</li>
            <li>Your gallery is private and only visible to salons during your appointments</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default UserGallery;
