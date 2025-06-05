import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, X, ZoomIn, Maximize2, Minimize2 } from 'lucide-react';

const ImageSlider = ({ 
  images, 
  autoPlay = true, 
  autoPlayInterval = 3000, 
  showThumbnails = true,
  adaptiveHeight = false,
  minHeight = '24rem' // 384px
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageMode, setImageMode] = useState('contain'); // 'contain' or 'cover'

  const toggleImageMode = () => {
    setImageMode(imageMode === 'contain' ? 'cover' : 'contain');
  };

  // Auto play functionality
  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, images.length, autoPlayInterval]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!isModalOpen) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          closeModal();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isModalOpen, goToPrevious, goToNext]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Không có ảnh để hiển thị</p>
      </div>
    );
  }

  return (
    <>
      {/* Main Slider */}
      <div className="relative w-full bg-white rounded-xl shadow-lg overflow-hidden">        {/* Image Container */}
        <div 
          className={`relative overflow-hidden bg-gray-100 ${
            adaptiveHeight ? '' : 'h-96 md:h-[500px] lg:h-[600px]'
          }`}
          style={adaptiveHeight ? { minHeight } : {}}
        >
          <div 
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((image, index) => (              <div key={index} className="min-w-full h-full relative flex items-center justify-center bg-gray-50">
                <img
                  src={image.src}
                  alt={image.alt || `Slide ${index + 1}`}
                  className={`cursor-zoom-in transition-all duration-300 ${
                    imageMode === 'contain' 
                      ? 'max-w-full max-h-full object-contain shadow-lg' 
                      : 'w-full h-full object-cover'
                  }`}
                  onClick={openModal}
                  onLoad={() => setIsLoading(false)}
                  onError={(e) => {
                    e.target.src = '/placeholder-image.svg'; // Fallback image
                  }}
                />                {/* Image overlay with title */}
                {image.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <h3 className="text-white text-xl font-semibold mb-2">{image.title}</h3>
                    {image.description && (
                      <p className="text-white/90 text-sm">{image.description}</p>
                    )}
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  {/* Image mode toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleImageMode();
                    }}
                    className="bg-black/50 hover:bg-black/70 rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity"
                    title={imageMode === 'contain' ? 'Fill khung hình' : 'Hiển thị toàn bộ ảnh'}
                  >
                    {imageMode === 'contain' ? 
                      <Maximize2 className="h-5 w-5 text-white" /> : 
                      <Minimize2 className="h-5 w-5 text-white" />
                    }
                  </button>
                  
                  {/* Zoom icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal();
                    }}
                    className="bg-black/50 hover:bg-black/70 rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity"
                    title="Xem toàn màn hình"
                  >
                    <ZoomIn className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary-color)' }}></div>
            </div>
          )}

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Play/Pause Button */}
          {images.length > 1 && (
            <button
              onClick={togglePlayPause}
              className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200"
              aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
          )}          {/* Slide Counter and Mode Indicator */}
          <div className="absolute top-4 right-1/2 transform translate-x-1/2 flex items-center space-x-2">
            <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
            <div className="bg-black/50 text-white px-3 py-1 rounded-full text-xs">
              {imageMode === 'contain' ? 'Toàn bộ' : 'Cắt vừa'}
            </div>
          </div>
        </div>

        {/* Dot Indicators */}
        {images.length > 1 && (
          <div className="flex justify-center space-x-2 py-4 bg-gray-50">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'scale-125' 
                    : 'hover:scale-110'
                }`}
                style={{
                  backgroundColor: index === currentIndex ? 'var(--primary-color)' : '#D1D5DB'
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}        {/* Thumbnails */}
        {showThumbnails && images.length > 1 && (
          <div className="px-4 pb-4 bg-gray-50">
            <div className="flex space-x-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 bg-gray-100 flex items-center justify-center ${
                    index === currentIndex 
                      ? 'scale-110 shadow-lg' 
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    borderColor: index === currentIndex ? 'var(--primary-color)' : 'transparent'
                  }}
                >
                  <img
                    src={image.src}
                    alt={`Thumbnail ${index + 1}`}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.svg';
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal for full-screen view */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="relative max-w-screen max-h-screen p-4">
            <img
              src={images[currentIndex].src}
              alt={images[currentIndex].alt || `Full size image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Modal Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all duration-200"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all duration-200"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}
            
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Image Info */}
            {images[currentIndex].title && (
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <h3 className="text-white text-2xl font-semibold mb-2">{images[currentIndex].title}</h3>
                {images[currentIndex].description && (
                  <p className="text-white/90">{images[currentIndex].description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageSlider;
