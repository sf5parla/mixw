import React, { useState, useRef, useEffect } from 'react';
import { useImageOptimization, useImageSEO } from '../../hooks/useImageOptimization';
import './LazyImage.css';

const LazyImage = ({
  src,
  alt,
  title,
  className = '',
  width,
  height,
  priority = false,
  quality = 85,
  placeholder = 'blur',
  onLoad,
  onError,
  context = {},
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  const { generateResponsiveImageProps, isSupported } = useImageOptimization();
  const { generateImageAltText, generateImageMetadata } = useImageSEO();

  // Generate optimized alt text if not provided
  const optimizedAlt = alt || generateImageAltText(context);
  
  // Generate responsive image properties
  const imageProps = generateResponsiveImageProps(src, {
    quality,
    priority,
    sizes: props.sizes || '100vw'
  });

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !isSupported.intersectionObserver) {
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
  }, [priority, isSupported.intersectionObserver]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setHasError(true);
    onError?.(e);
  };

  // Generate structured data for SEO
  const imageMetadata = generateImageMetadata(
    { src, alt: optimizedAlt, type: 'image/jpeg' },
    { title, width, height, ...context }
  );

  return (
    <div 
      ref={imgRef}
      className={`lazy-image-container ${className}`}
      style={{ width, height }}
    >
      {isInView && !hasError ? (
        <>
          {/* Modern browsers with picture element */}
          {isSupported.webp ? (
            <picture className="lazy-picture">
              {/* WebP source */}
              <source
                srcSet={imageProps['data-webp-srcset']}
                sizes={imageProps.sizes}
                type="image/webp"
              />
              
              {/* Fallback source */}
              <img
                src={imageProps.src}
                srcSet={imageProps.srcSet}
                sizes={imageProps.sizes}
                alt={optimizedAlt}
                title={title}
                className={`lazy-image ${isLoaded ? 'loaded' : ''}`}
                loading={imageProps.loading}
                decoding={imageProps.decoding}
                onLoad={handleLoad}
                onError={handleError}
                {...props}
              />
            </picture>
          ) : (
            /* Fallback for older browsers */
            <img
              src={imageProps.src}
              srcSet={imageProps.srcSet}
              sizes={imageProps.sizes}
              alt={optimizedAlt}
              title={title}
              className={`lazy-image ${isLoaded ? 'loaded' : ''}`}
              loading={imageProps.loading}
              decoding={imageProps.decoding}
              onLoad={handleLoad}
              onError={handleError}
              {...props}
            />
          )}
        </>
      ) : hasError ? (
        <div className="image-error" role="img" aria-label={optimizedAlt}>
          <div className="error-icon">🖼️</div>
          <span className="error-text">Image unavailable</span>
        </div>
      ) : (
        <div className="image-placeholder" role="img" aria-label="Loading image">
          {placeholder === 'blur' && <div className="blur-placeholder" />}
          {placeholder === 'skeleton' && <div className="skeleton-placeholder" />}
          <div className="loading-indicator" />
        </div>
      )}
      
      {/* Structured data for SEO */}
      {isLoaded && !hasError && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(imageMetadata.structuredData)
          }}
        />
      )}
    </div>
  );
};

export default LazyImage;