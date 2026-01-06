import { useState, useRef } from 'react';
import './../../styles/image-upload.css';

const ImageUpload = ({ onUpload, onSkip }) => {
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!preview || isUploading) return;

    setIsUploading(true);

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (onUpload) {
      onUpload(preview);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <div className="image-upload-container">
      <div className="upload-header">
        <div className="upload-icon">📸</div>
        <div className="upload-title">Add a Photo (Optional)</div>
        <div className="upload-subtitle">
          Upload a photo of your jewelry for your records
        </div>
      </div>

      {!preview ? (
        <div
          className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="file-input"
          />

          <div className="dropzone-content">
            <div className="dropzone-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="dropzone-text">
              <span className="primary-text">Click to upload</span>
              <span className="secondary-text">or drag and drop</span>
            </div>
            <div className="dropzone-hint">PNG, JPG up to 10MB</div>
          </div>
        </div>
      ) : (
        <div className="preview-container">
          <div className="image-preview">
            <img src={preview} alt="Jewelry preview" />
            <button className="remove-button" onClick={handleRemove}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <button
            className="upload-button"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <span className="button-loading">
                <span className="loading-spinner" />
                Uploading...
              </span>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Continue with Photo
              </>
            )}
          </button>
        </div>
      )}

      <button className="skip-button" onClick={handleSkip}>
        Skip for now
      </button>
    </div>
  );
};

export default ImageUpload;
