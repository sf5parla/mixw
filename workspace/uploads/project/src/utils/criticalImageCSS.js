// Critical Image CSS Generator for Above-the-Fold Optimization

export class CriticalImageCSS {
  constructor() {
    this.criticalImages = new Map();
    this.generatedCSS = '';
  }

  // Add critical image with placeholder
  addCriticalImage(id, config) {
    const {
      src,
      placeholder,
      width,
      height,
      aspectRatio,
      objectFit = 'cover',
      priority = true
    } = config;

    this.criticalImages.set(id, {
      src,
      placeholder: placeholder || this.generatePlaceholder(src),
      width,
      height,
      aspectRatio,
      objectFit,
      priority
    });
  }

  // Generate low-quality placeholder
  generatePlaceholder(src) {
    // For TMDB images, use a smaller size
    if (src.includes('themoviedb.org')) {
      return src.replace(/w\d+/, 'w92');
    }
    
    // For local images, assume a placeholder exists
    const extension = src.split('.').pop();
    const baseName = src.replace(`.${extension}`, '');
    return `${baseName}-placeholder.${extension}`;
  }

  // Generate critical CSS
  generateCSS() {
    let css = '/* Critical Image CSS - Above the Fold Optimization */\n';
    
    this.criticalImages.forEach((config, id) => {
      css += this.generateImageCSS(id, config);
    });

    // Add base critical image styles
    css += this.getBaseCriticalStyles();
    
    this.generatedCSS = css;
    return css;
  }

  // Generate CSS for individual image
  generateImageCSS(id, config) {
    const {
      placeholder,
      width,
      height,
      aspectRatio,
      objectFit
    } = config;

    return `
.critical-image-${id} {
  background-image: url('${placeholder}');
  background-size: ${objectFit};
  background-position: center;
  background-repeat: no-repeat;
  ${width ? `width: ${width}px;` : ''}
  ${height ? `height: ${height}px;` : ''}
  ${aspectRatio ? `aspect-ratio: ${aspectRatio};` : ''}
  filter: blur(5px);
  transition: filter 0.3s ease;
}

.critical-image-${id}.loaded {
  background-image: none;
  filter: none;
}

.critical-image-${id} img {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.critical-image-${id}.loaded img {
  opacity: 1;
}
`;
  }

  // Base styles for all critical images
  getBaseCriticalStyles() {
    return `
/* Base Critical Image Styles */
.critical-image-container {
  position: relative;
  overflow: hidden;
}

.critical-image-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
              linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
              linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  opacity: 0.1;
  z-index: -1;
}

@media (prefers-color-scheme: dark) {
  .critical-image-container::before {
    background: linear-gradient(45deg, #333 25%, transparent 25%),
                linear-gradient(-45deg, #333 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #333 75%),
                linear-gradient(-45deg, transparent 75%, #333 75%);
  }
}

/* Progressive enhancement */
@supports (aspect-ratio: 1) {
  .critical-image-responsive {
    aspect-ratio: var(--aspect-ratio, 16/9);
    height: auto;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .critical-image-container,
  .critical-image-container img {
    transition: none !important;
  }
}
`;
  }

  // Inject CSS into document head
  injectCSS() {
    if (typeof document === 'undefined') return;

    const existingStyle = document.getElementById('critical-image-css');
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'critical-image-css';
    style.textContent = this.generateCSS();
    document.head.appendChild(style);
  }

  // Generate CSS for build process
  generateForBuild() {
    return {
      css: this.generateCSS(),
      images: Array.from(this.criticalImages.entries()).map(([id, config]) => ({
        id,
        ...config
      }))
    };
  }

  // Auto-detect critical images from viewport
  autoDetectCriticalImages() {
    if (typeof window === 'undefined') return;

    const viewportHeight = window.innerHeight;
    const images = document.querySelectorAll('img');
    
    images.forEach((img, index) => {
      const rect = img.getBoundingClientRect();
      
      // Image is in viewport or close to it
      if (rect.top < viewportHeight + 100) {
        const id = img.dataset.criticalId || `auto-${index}`;
        
        this.addCriticalImage(id, {
          src: img.src || img.dataset.src,
          width: img.width,
          height: img.height,
          aspectRatio: img.width && img.height ? `${img.width}/${img.height}` : null,
          priority: rect.top < viewportHeight
        });
      }
    });
  }
}

// Utility functions
export function generateCriticalImageCSS(images) {
  const generator = new CriticalImageCSS();
  
  images.forEach(image => {
    generator.addCriticalImage(image.id, image);
  });
  
  return generator.generateCSS();
}

export function injectCriticalImageCSS(images) {
  const generator = new CriticalImageCSS();
  
  images.forEach(image => {
    generator.addCriticalImage(image.id, image);
  });
  
  generator.injectCSS();
}

// Auto-initialize for critical images
export function initializeCriticalImages() {
  const generator = new CriticalImageCSS();
  
  // Auto-detect on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      generator.autoDetectCriticalImages();
      generator.injectCSS();
    });
  } else {
    generator.autoDetectCriticalImages();
    generator.injectCSS();
  }
  
  return generator;
}

export default CriticalImageCSS;