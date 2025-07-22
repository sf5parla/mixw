// Image Preloader for Critical Performance

export class ImagePreloader {
  constructor() {
    this.preloadedImages = new Set();
    this.preloadQueue = [];
    this.maxConcurrent = 3;
    this.currentlyLoading = 0;
  }

  // Preload critical images
  preloadCritical(images) {
    const criticalImages = images.slice(0, 4); // First 4 images
    
    criticalImages.forEach((src, index) => {
      this.preload(src, { priority: 'high', delay: index * 100 });
    });
  }

  // Preload single image
  async preload(src, options = {}) {
    const { priority = 'low', delay = 0 } = options;
    
    if (this.preloadedImages.has(src)) {
      return Promise.resolve();
    }

    if (delay > 0) {
      await this.wait(delay);
    }

    return new Promise((resolve, reject) => {
      if (this.currentlyLoading >= this.maxConcurrent && priority === 'low') {
        this.preloadQueue.push({ src, resolve, reject, options });
        return;
      }

      this.loadImage(src, resolve, reject);
    });
  }

  // Load image with tracking
  loadImage(src, resolve, reject) {
    this.currentlyLoading++;
    
    const img = new Image();
    
    img.onload = () => {
      this.preloadedImages.add(src);
      this.currentlyLoading--;
      this.processQueue();
      resolve(img);
    };
    
    img.onerror = () => {
      this.currentlyLoading--;
      this.processQueue();
      reject(new Error(`Failed to preload image: ${src}`));
    };
    
    // Set crossorigin for CORS images
    if (src.includes('themoviedb.org')) {
      img.crossOrigin = 'anonymous';
    }
    
    img.src = src;
  }

  // Process preload queue
  processQueue() {
    while (this.preloadQueue.length > 0 && this.currentlyLoading < this.maxConcurrent) {
      const { src, resolve, reject } = this.preloadQueue.shift();
      this.loadImage(src, resolve, reject);
    }
  }

  // Utility wait function
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Preload images for next page
  preloadNextPage(images) {
    // Preload with low priority after a delay
    setTimeout(() => {
      images.forEach(src => {
        this.preload(src, { priority: 'low' });
      });
    }, 2000);
  }

  // Clear preload cache
  clearCache() {
    this.preloadedImages.clear();
    this.preloadQueue = [];
  }

  // Get preload statistics
  getStats() {
    return {
      preloaded: this.preloadedImages.size,
      queued: this.preloadQueue.length,
      loading: this.currentlyLoading
    };
  }
}

// Preload strategy for different page types
export class PreloadStrategy {
  constructor() {
    this.preloader = new ImagePreloader();
  }

  // Homepage preload strategy
  preloadHomepage(featuredContent = []) {
    const criticalImages = [];
    
    // Hero image
    if (featuredContent[0]?.backdrop_path) {
      criticalImages.push(
        `https://image.tmdb.org/t/p/w1920_and_h800_multi_faces${featuredContent[0].backdrop_path}`
      );
    }
    
    // First row of posters
    featuredContent.slice(0, 6).forEach(item => {
      if (item.poster_path) {
        criticalImages.push(
          `https://image.tmdb.org/t/p/w500${item.poster_path}`
        );
      }
    });
    
    this.preloader.preloadCritical(criticalImages);
  }

  // Movie detail page preload strategy
  preloadMovieDetail(movie, similarMovies = []) {
    const criticalImages = [];
    
    // Movie backdrop
    if (movie.backdrop_path) {
      criticalImages.push(
        `https://image.tmdb.org/t/p/w1920_and_h800_multi_faces${movie.backdrop_path}`
      );
    }
    
    // Movie poster
    if (movie.poster_path) {
      criticalImages.push(
        `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      );
    }
    
    this.preloader.preloadCritical(criticalImages);
    
    // Preload similar movies for next navigation
    const similarImages = similarMovies.slice(0, 6).map(item => 
      `https://image.tmdb.org/t/p/w500${item.poster_path}`
    ).filter(Boolean);
    
    this.preloader.preloadNextPage(similarImages);
  }

  // Search results preload strategy
  preloadSearchResults(results = []) {
    const criticalImages = results.slice(0, 8).map(item => {
      if (item.poster_path) {
        return `https://image.tmdb.org/t/p/w500${item.poster_path}`;
      }
      if (item.profile_path) {
        return `https://image.tmdb.org/t/p/w500${item.profile_path}`;
      }
      return null;
    }).filter(Boolean);
    
    this.preloader.preloadCritical(criticalImages);
  }

  // Generic content grid preload
  preloadContentGrid(content = []) {
    const criticalImages = content.slice(0, 12).map(item => 
      item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null
    ).filter(Boolean);
    
    this.preloader.preloadCritical(criticalImages);
  }
}

// Hook for preload strategies
export function useImagePreloader() {
  const strategy = new PreloadStrategy();
  
  return {
    preloadHomepage: strategy.preloadHomepage.bind(strategy),
    preloadMovieDetail: strategy.preloadMovieDetail.bind(strategy),
    preloadSearchResults: strategy.preloadSearchResults.bind(strategy),
    preloadContentGrid: strategy.preloadContentGrid.bind(strategy),
    getStats: strategy.preloader.getStats.bind(strategy.preloader)
  };
}

// Auto-initialize preloader
export const globalPreloader = new ImagePreloader();
export const preloadStrategy = new PreloadStrategy();