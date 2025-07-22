import { useState, useEffect, useCallback } from 'react';
import { imageOptimizer } from '../utils/imageOptimization';

// Hook for image optimization and lazy loading
export const useImageOptimization = () => {
  const [isSupported, setIsSupported] = useState({
    webp: false,
    avif: false,
    lazyLoading: false,
    intersectionObserver: false
  });

  useEffect(() => {
    // Check browser support
    setIsSupported({
      webp: imageOptimizer.supportedFormats.webp,
      avif: imageOptimizer.supportedFormats.avif,
      lazyLoading: 'loading' in HTMLImageElement.prototype,
      intersectionObserver: 'IntersectionObserver' in window
    });
  }, []);

  const preloadCriticalImages = useCallback((images) => {
    images.forEach(src => {
      imageOptimizer.preloadImage(src);
    });
  }, []);

  const generateResponsiveImageProps = useCallback((src, options = {}) => {
    const {
      sizes = '100vw',
      quality = 85,
      priority = false
    } = options;

    if (!src) return {};

    const srcSet = imageOptimizer.generateSrcSet(src);
    const webpSources = imageOptimizer.generateWebPSources(src);

    return {
      src,
      srcSet,
      sizes,
      loading: priority ? 'eager' : 'lazy',
      decoding: 'async',
      ...(webpSources && { 'data-webp-srcset': webpSources.srcSet })
    };
  }, []);

  return {
    isSupported,
    preloadCriticalImages,
    generateResponsiveImageProps,
    imageOptimizer
  };
};

// Hook for image SEO metadata
export const useImageSEO = () => {
  const generateImageMetadata = useCallback((image, context = {}) => {
    const {
      title,
      description,
      url,
      width,
      height,
      type = 'image'
    } = context;

    return {
      // Open Graph
      'og:image': image.src,
      'og:image:alt': image.alt,
      'og:image:width': width,
      'og:image:height': height,
      'og:image:type': image.type || 'image/jpeg',
      
      // Twitter Card
      'twitter:image': image.src,
      'twitter:image:alt': image.alt,
      
      // Structured Data
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        url: image.src,
        description: image.alt,
        name: title || image.alt,
        ...(width && { width }),
        ...(height && { height }),
        encodingFormat: image.type || 'image/jpeg'
      }
    };
  }, []);

  const generateImageAltText = useCallback((context = {}) => {
    const {
      title,
      type,
      year,
      actors,
      genre,
      description
    } = context;

    let altText = '';

    if (title) {
      altText += title;
    }

    if (type === 'poster') {
      altText += ' movie poster';
    } else if (type === 'backdrop') {
      altText += ' movie scene';
    } else if (type === 'profile') {
      altText += ' profile photo';
    }

    if (year) {
      altText += ` (${year})`;
    }

    if (actors && actors.length > 0) {
      altText += ` starring ${actors.slice(0, 2).join(' and ')}`;
    }

    if (genre) {
      altText += ` - ${genre} film`;
    }

    if (description && !altText) {
      altText = description;
    }

    return altText.trim() || 'Image';
  }, []);

  return {
    generateImageMetadata,
    generateImageAltText
  };
};

// Hook for image performance monitoring
export const useImagePerformance = () => {
  const [metrics, setMetrics] = useState({
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
    largestContentfulPaint: 0
  });

  useEffect(() => {
    // Monitor image loading performance
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach(entry => {
        if (entry.initiatorType === 'img') {
          setMetrics(prev => ({
            ...prev,
            totalImages: prev.totalImages + 1,
            averageLoadTime: (prev.averageLoadTime + entry.duration) / 2
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });

    // Monitor LCP for image optimization
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      if (lastEntry.element && lastEntry.element.tagName === 'IMG') {
        setMetrics(prev => ({
          ...prev,
          largestContentfulPaint: lastEntry.startTime
        }));
      }
    });

    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    return () => {
      observer.disconnect();
      lcpObserver.disconnect();
    };
  }, []);

  const trackImageLoad = useCallback((success = true) => {
    setMetrics(prev => ({
      ...prev,
      loadedImages: success ? prev.loadedImages + 1 : prev.loadedImages,
      failedImages: success ? prev.failedImages : prev.failedImages + 1
    }));
  }, []);

  return {
    metrics,
    trackImageLoad
  };
};