// Image Compression and Optimization Utilities

export class ImageCompressor {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.maxWidth = 1920;
    this.maxHeight = 1080;
    this.quality = 0.85;
  }

  // Compress image file
  async compressImage(file, options = {}) {
    const {
      maxWidth = this.maxWidth,
      maxHeight = this.maxHeight,
      quality = this.quality,
      format = 'image/jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        const { width, height } = this.calculateDimensions(
          img.width, 
          img.height, 
          maxWidth, 
          maxHeight
        );

        this.canvas.width = width;
        this.canvas.height = height;

        // Draw and compress
        this.ctx.drawImage(img, 0, 0, width, height);
        
        this.canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Compression failed'));
            }
          },
          format,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Calculate optimal dimensions maintaining aspect ratio
  calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // Scale down if necessary
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  // Generate multiple sizes for responsive images
  async generateResponsiveSizes(file, sizes = [320, 640, 768, 1024, 1280, 1920]) {
    const results = {};
    
    for (const size of sizes) {
      try {
        const compressed = await this.compressImage(file, {
          maxWidth: size,
          maxHeight: size,
          quality: this.getQualityForSize(size)
        });
        
        results[`${size}w`] = compressed;
      } catch (error) {
        console.warn(`Failed to generate ${size}w version:`, error);
      }
    }
    
    return results;
  }

  // Adjust quality based on image size
  getQualityForSize(size) {
    if (size <= 320) return 0.75;
    if (size <= 640) return 0.80;
    if (size <= 1024) return 0.85;
    return 0.90;
  }

  // Convert to WebP format
  async convertToWebP(file, quality = 0.85) {
    return this.compressImage(file, {
      format: 'image/webp',
      quality
    });
  }

  // Generate optimized filename
  generateOptimizedFilename(originalName, size, format = 'jpg') {
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const sanitized = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    return `${sanitized}-${size}w.${format}`;
  }
}

// Image format detection and conversion
export class ImageFormatOptimizer {
  constructor() {
    this.supportedFormats = this.detectSupportedFormats();
  }

  detectSupportedFormats() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    return {
      webp: canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0,
      avif: canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0,
      jpeg2000: canvas.toDataURL('image/jp2').indexOf('data:image/jp2') === 0
    };
  }

  // Get optimal format for browser
  getOptimalFormat(originalFormat = 'jpeg') {
    if (this.supportedFormats.avif) return 'avif';
    if (this.supportedFormats.webp) return 'webp';
    if (this.supportedFormats.jpeg2000) return 'jpeg2000';
    return originalFormat;
  }

  // Generate format-specific sources
  generateFormatSources(baseSrc, sizes) {
    const sources = [];
    
    if (this.supportedFormats.avif) {
      sources.push({
        srcSet: this.generateSrcSetForFormat(baseSrc, sizes, 'avif'),
        type: 'image/avif'
      });
    }
    
    if (this.supportedFormats.webp) {
      sources.push({
        srcSet: this.generateSrcSetForFormat(baseSrc, sizes, 'webp'),
        type: 'image/webp'
      });
    }
    
    // Fallback
    sources.push({
      srcSet: this.generateSrcSetForFormat(baseSrc, sizes, 'jpeg'),
      type: 'image/jpeg'
    });
    
    return sources;
  }

  generateSrcSetForFormat(baseSrc, sizes, format) {
    const extension = format === 'jpeg' ? 'jpg' : format;
    const baseName = baseSrc.replace(/\.[^/.]+$/, '');
    
    return sizes
      .map(size => `${baseName}-${size}w.${extension} ${size}w`)
      .join(', ');
  }
}

// Batch image processing
export class BatchImageProcessor {
  constructor() {
    this.compressor = new ImageCompressor();
    this.formatOptimizer = new ImageFormatOptimizer();
    this.queue = [];
    this.processing = false;
  }

  // Add images to processing queue
  addToQueue(files, options = {}) {
    const tasks = Array.from(files).map(file => ({
      file,
      options,
      id: this.generateId()
    }));
    
    this.queue.push(...tasks);
    
    if (!this.processing) {
      this.processQueue();
    }
    
    return tasks.map(task => task.id);
  }

  // Process queue
  async processQueue() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      
      try {
        const result = await this.processImage(task.file, task.options);
        this.onTaskComplete?.(task.id, result);
      } catch (error) {
        this.onTaskError?.(task.id, error);
      }
    }
    
    this.processing = false;
  }

  // Process individual image
  async processImage(file, options = {}) {
    const {
      generateResponsive = true,
      convertToWebP = true,
      sizes = [320, 640, 768, 1024, 1280, 1920]
    } = options;

    const results = {
      original: file,
      compressed: {},
      webp: {},
      metadata: await this.extractMetadata(file)
    };

    // Generate responsive sizes
    if (generateResponsive) {
      results.compressed = await this.compressor.generateResponsiveSizes(file, sizes);
    }

    // Convert to WebP
    if (convertToWebP && this.formatOptimizer.supportedFormats.webp) {
      for (const size of sizes) {
        try {
          const webpVersion = await this.compressor.compressImage(file, {
            maxWidth: size,
            maxHeight: size,
            format: 'image/webp',
            quality: 0.85
          });
          results.webp[`${size}w`] = webpVersion;
        } catch (error) {
          console.warn(`Failed to generate WebP ${size}w:`, error);
        }
      }
    }

    return results;
  }

  // Extract image metadata
  async extractMetadata(file) {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
          size: file.size,
          type: file.type,
          name: file.name,
          lastModified: file.lastModified
        });
      };
      
      img.onerror = () => {
        resolve({
          size: file.size,
          type: file.type,
          name: file.name,
          lastModified: file.lastModified
        });
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // Event handlers
  onTaskComplete = null;
  onTaskError = null;
}

// Export instances
export const imageCompressor = new ImageCompressor();
export const formatOptimizer = new ImageFormatOptimizer();
export const batchProcessor = new BatchImageProcessor();