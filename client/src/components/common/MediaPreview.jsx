import React, { useEffect, useState } from 'react';

const MediaPreview = ({ isOpen, onClose, mediaUrl, mediaType, caption }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      const maxWidth = window.innerWidth * 0.9;
      const maxHeight = window.innerHeight * 0.9;
      setDimensions({ width: maxWidth, height: maxHeight });
    };

    if (isOpen) {
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
    }

    return () => window.removeEventListener('resize', updateDimensions);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl w-full mx-4"
        onClick={e => e.stopPropagation()}
        style={{
          width: dimensions.width,
          height: dimensions.height
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute -top-10 right-0 btn btn-circle btn-ghost text-white hover:bg-base-100/20"
          aria-label="Close preview"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>

        {/* Media Content */}
        <div className="bg-base-100 rounded-lg overflow-hidden">
          {mediaType === 'video' ? (
            <video
              className="w-full h-auto max-h-[80vh] object-contain"
              controls
              autoPlay
              src={mediaUrl}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <img
              src={mediaUrl}
              alt="Preview"
              className="w-full h-auto max-h-[80vh] object-contain"
              onClick={e => e.stopPropagation()}
            />
          )}
          
        </div>
      </div>
    </div>
  );
};

export default MediaPreview;