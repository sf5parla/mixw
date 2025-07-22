// Image Optimization Utilities

export class ImageOptimizer {
  constructor() {
    this.supportedFormats = this.detectSupportedFormats();
    this.devicePixelRatio = window.devicePixelRatio || 1;
  }

  // Detect browser support for modern image formats
  detectSupportedFormats() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    const formats = {
      webp: canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0,
      avif: canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0,
      jpeg2000: canvas.toDataURL('image/jp2').indexOf('data:image/jp2') === 0
    };
    
    return formats;
  }

  // Generate optimized image URLs for TMDB
  generateTMDBImageURL(path, baseWidth = 500) {
    if (!path) return null;
    
    const sizes = [200, 300, 500, 780, 1280];
    const optimalWidth = this.getOptimalWidth(baseWidth);
    const closestSize = sizes.reduce((prev, curr) => 
      Math.abs(curr - optimalWidth) < Math.abs(prev - optimalWidth) ? curr : prev
    );
    
    return `https://image.tmdb.org/t/p/w${closestSize}${path}`;
  }

  // Generate srcset for responsive images
  generateSrcSet(basePath, sizes = [320, 640, 768, 1024, 1280, 1920]) {
    if (!basePath) return '';
    
    if (basePath.includes('themoviedb.org')) {
      return sizes
        .map(width => {
          const url = basePath.replace(/w\d+/, `w${width}`);
          return `${url} ${width}w`;
        })
        .join(', ');
    }
    
    // For local images
    const extension = basePath.split('.').pop();
    const baseName = basePath.replace(`.${extension}`, '');
    
    return sizes
      .map(width => `${baseName}-${width}w.${extension} ${width}w`)
      .join(', ');
  }

  // Generate WebP sources with fallbacks
  generateWebPSources(originalSrc, sizes) {
    if (!this.supportedFormats.webp) return null;
    
    const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    return {
      srcSet: this.generateSrcSet(webpSrc, sizes),
      type: 'image/webp'
    };
  }

  // Calculate optimal image width based on container and DPR
  getOptimalWidth(containerWidth) {
    return Math.ceil(containerWidth * this.devicePixelRatio);
  }

  // Generate sizes attribute for responsive images
  generateSizesAttribute(breakpoints = {}) {
    const defaultBreakpoints = {
      mobile: '(max-width: 768px) 100vw',
      tablet: '(max-width: 1024px) 50vw',
      desktop: '33vw'
    };
    
    const merged = { ...defaultBreakpoints, ...breakpoints };
    return Object.values(merged).join(', ');
  }

  // Preload critical images
  preloadImage(src, as = 'image') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = as;
    link.href = src;
    document.head.appendChild(link);
  }

  // Lazy load images with Intersection Observer
  lazyLoadImages(selector = '.lazy-image') {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      this.loadAllImages(selector);
      return;
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          this.loadImage(img);
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    document.querySelectorAll(selector).forEach(img => {
      imageObserver.observe(img);
    });
  }

  // Load individual image
  loadImage(img) {
    if (img.dataset.src) {
      img.src = img.dataset.src;
    }
    if (img.dataset.srcset) {
      img.srcset = img.dataset.srcset;
    }
    img.classList.remove('lazy-image');
    img.classList.add('loaded');
  }

  // Fallback for browsers without Intersection Observer
  loadAllImages(selector) {
    document.querySelectorAll(selector).forEach(img => {
      this.loadImage(img);
    });
  }

  // Generate image metadata for SEO
  generateImageMetadata(src, alt, title, width, height) {
    return {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      url: src,
      description: alt,
      name: title || alt,
      ...(width && { width }),
      ...(height && { height }),
      encodingFormat: this.getImageFormat(src)
    };
  }

  // Get image format from URL
  getImageFormat(src) {
    const extension = src.split('.').pop().toLowerCase();
    const formatMap = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      avif: 'image/avif',
      svg: 'image/svg+xml'
    };
    return formatMap[extension] || 'image/jpeg';
  }

  // Compress image quality based on connection
  getOptimalQuality() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return 60; // Lower quality for slow connections
      } else if (connection.effectiveType === '3g') {
        return 75;
      }
    }
    return 85; // Default quality
  }

  // Generate critical CSS for above-the-fold images
  generateCriticalImageCSS(images) {
    return images.map(img => `
      .critical-image-${img.id} {
        background-image: url('${img.placeholder}');
        background-size: cover;
        background-position: center;
        filter: blur(5px);
        transition: filter 0.3s ease;
      }
      .critical-image-${img.id}.loaded {
        filter: none;
      }
    `).join('\n');
  }
}

// Image naming utilities
export class ImageNamingHelper {
  static generateSEOFriendlyName(originalName, context = {}) {
    const { title, type, category, year } = context;
    
    let seoName = '';
    
    if (title) {
      seoName += this.slugify(title);
    }
    
    if (type) {
      seoName += `-${type}`;
    }
    
    if (category) {
      seoName += `-${category}`;
    }
    
    if (year) {
      seoName += `-${year}`;
    }
    
    return seoName || this.slugify(originalName);
  }

  static slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  static generateAltText(context = {}) {
    const { title, type, actors, year, genre } = context;
    
    let altText = '';
    
    if (title) {
      altText += title;
    }
    
    if (type === 'poster') {
      altText += ' movie poster';
    } else if (type === 'backdrop') {
      altText += ' movie scene';
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
    
    return altText.trim();
  }
}

// Initialize image optimizer
export const imageOptimizer = new ImageOptimizer();

// Auto-initialize lazy loading when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    imageOptimizer.lazyLoadImages();
  });
} else {
  imageOptimizer.lazyLoadImages();
}