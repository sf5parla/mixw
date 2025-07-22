import React, { useState, useRef, useEffect } from 'react';
import './OptimizedImage.css';

const OptimizedImage = ({
  src,
  alt,
  title,
  className = '',
  sizes = '100vw',
  loading = 'lazy',
  priority = false,
  aspectRatio,
  objectFit = 'cover',
  placeholder = 'blur',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Generate responsive image sources
  const generateSrcSet = (baseSrc) => {
    if (!baseSrc) return '';
    
    const widths = [320, 640, 768, 1024, 1280, 1920];
    const baseUrl = baseSrc.includes('themoviedb.org') 
      ? baseSrc.replace(/w\d+/, '') 
      : baseSrc;
    
    if (baseSrc.includes('themoviedb.org')) {
      return widths
        .map(width => `${baseUrl}w${width} ${width}w`)
        .join(', ');
    }
    
    // For local images, assume different sizes exist
    const extension = baseSrc.split('.').pop();
    const baseName = baseSrc.replace(`.${extension}`, '');
    
    return widths
      .map(width => `${baseName}-${width}w.${extension} ${width}w`)
      .join(', ');
  };

  // WebP support detection and source generation
  const generateWebPSources = (baseSrc) => {
    if (!baseSrc) return null;
    
    const webpSrc = baseSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const srcSet = generateSrcSet(webpSrc);
    
    return srcSet ? { srcSet, type: 'image/webp' } : null;
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') {
      setIsInView(true);
      return;
    }

    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority, loading]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setHasError(true);
    onError?.(e);
  };

  const webpSources = generateWebPSources(src);
  const fallbackSrcSet = generateSrcSet(src);

  return (
    <div 
      ref={imgRef}
      className={`optimized-image-container ${className}`}
      style={{ aspectRatio }}
    >
      {isInView && !hasError ? (
        <picture className="optimized-picture">
          {/* WebP sources for modern browsers */}
          {webpSources && (
            <source
              srcSet={webpSources.srcSet}
              sizes={sizes}
              type="image/webp"
            />
          )}
          
          {/* Fallback sources */}
          <source
            srcSet={fallbackSrcSet}
            sizes={sizes}
            type="image/jpeg"
          />
          
          {/* Main image element */}
          <img
            src={src}
            alt={alt}
            title={title}
            className={`optimized-image ${isLoaded ? 'loaded' : ''}`}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            style={{ objectFit }}
            {...props}
          />
        </picture>
      ) : hasError ? (
        <div className="image-error-placeholder">
          <div className="error-icon">🖼️</div>
          <span>Image not available</span>
        </div>
      ) : (
        <div className="image-placeholder">
          {placeholder === 'blur' && (
            <div className="blur-placeholder" />
          )}
          <div className="loading-spinner" />
        </div>
      )}
      
      {/* Structured data for SEO */}
      {isLoaded && !hasError && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ImageObject",
              "url": src,
              "description": alt,
              "name": title || alt
            })
          }}
        />
      )}
    </div>
  );
};

export default OptimizedImage;