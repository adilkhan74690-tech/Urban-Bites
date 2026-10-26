import React, { useState } from 'react';
import { FALLBACK_FOOD_IMAGE } from '../../data/menuData';

interface FoodImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export const FoodImage: React.FC<FoodImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy'
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(FALLBACK_FOOD_IMAGE);
    }
  };

  return (
    <div className={`relative overflow-hidden bg-warmgray-200 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-warmgray-200 animate-pulse flex items-center justify-center">
          <span className="text-warmgray-400 text-xs">Loading...</span>
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        loading={loading}
        onLoad={() => setIsLoading(false)}
        onError={handleError}
        className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
};
