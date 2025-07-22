# Image Optimization Implementation Guide

## Quick Start

### 1. Replace Existing Images with Optimized Components

```jsx
// Before
<img src="movie-poster.jpg" alt="Movie poster" />

// After
import OptimizedImage from './components/OptimizedImage/OptimizedImage';

<OptimizedImage
  src="movie-poster.jpg"
  alt="The Dark Knight (2008) movie poster starring Christian Bale and Heath Ledger"
  title="The Dark Knight Official Poster"
  aspectRatio="2/3"
  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
  priority={index < 4} // For above-the-fold images
/>
```

### 2. Update Movie Cards

```jsx
// In MovieCard component
import LazyImage from './components/LazyImage/LazyImage';
import { ImageNamingHelper } from './utils/imageOptimization';

const MovieCard = ({ movie, index }) => {
  const context = {
    title: movie.title,
    type: 'poster',
    year: new Date(movie.release_date).getFullYear(),
    genre: movie.genres?.[0]?.name
  };
  
  const altText = ImageNamingHelper.generateAltText(context);
  
  return (
    <div className="movie-card">
      <LazyImage
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={altText}
        context={context}
        priority={index < 4}
        sizes="(max-width: 768px) 50vw, 33vw"
      />
    </div>
  );
};
```

### 3. Generate Image Sitemap

```jsx
// In your build process or admin panel
import { generateImageSitemap } from './utils/imageSitemap';

const generateSitemap = async () => {
  const movies = await fetchAllMovies();
  const tvShows = await fetchAllTVShows();
  const people = await fetchAllPeople();
  
  const sitemap = await generateImageSitemap({
    movies,
    tvShows,
    people
  });
  
  // Save to public/sitemap-images.xml
  await saveSitemap(sitemap);
};
```

### 4. Implement Critical Image CSS

```jsx
// In your main App component
import { initializeCriticalImages } from './utils/criticalImageCSS';

useEffect(() => {
  // Initialize critical image optimization
  initializeCriticalImages();
}, []);
```

## File Naming Best Practices

### Current Issues:
- `big_logo.png` → Should be `streamflix-main-logo-2024.png`
- `small_logo.png` → Should be `streamflix-header-logo.png`
- `share.jpg` → Should be `streamflix-social-share-image.jpg`

### Recommended Naming:
```
// Movie posters
the-dark-knight-2008-movie-poster.jpg
avengers-endgame-2019-poster-imax.jpg

// Backdrops
the-dark-knight-2008-movie-scene-gotham.jpg
avengers-endgame-2019-final-battle-scene.jpg

// Profile photos
christian-bale-actor-profile-photo.jpg
christopher-nolan-director-headshot.jpg

// UI Elements
streamflix-main-logo-red-2024.png
streamflix-favicon-32x32.png
english-language-flag-icon.png
```

## Compression Guidelines

### Image Quality Settings:
- **Hero images**: 90% quality
- **Movie posters**: 85% quality
- **Thumbnails**: 75% quality
- **Icons/logos**: PNG format, optimized

### Size Breakpoints:
```javascript
const imageSizes = {
  mobile: [320, 640],
  tablet: [768, 1024],
  desktop: [1280, 1920],
  retina: [2560, 3840]
};
```

## Lazy Loading Implementation

### Native Lazy Loading:
```jsx
<img 
  src="image.jpg" 
  loading="lazy" 
  decoding="async"
  alt="Descriptive alt text"
/>
```

### Intersection Observer Fallback:
```javascript
const lazyImageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      lazyImageObserver.unobserve(img);
    }
  });
});
```

## Performance Monitoring

### Core Web Vitals Impact:
- **LCP**: Optimize hero images with priority loading
- **CLS**: Use aspect-ratio to prevent layout shifts
- **FID**: Lazy load non-critical images

### Monitoring Code:
```javascript
// Monitor image loading performance
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    if (entry.initiatorType === 'img') {
      console.log(`Image loaded: ${entry.name} in ${entry.duration}ms`);
    }
  });
});

observer.observe({ entryTypes: ['resource'] });
```

## Next Steps

1. **Immediate Actions**:
   - Replace all `<img>` tags with `<OptimizedImage>` components
   - Update file names following SEO conventions
   - Generate and submit image sitemap

2. **Medium Term**:
   - Implement WebP conversion for all images
   - Set up automated image compression pipeline
   - Add structured data for all images

3. **Long Term**:
   - Implement AVIF format support
   - Set up CDN with automatic image optimization
   - Monitor and optimize based on Core Web Vitals

## Testing Checklist

- [ ] All images have descriptive alt text
- [ ] File names are SEO-friendly
- [ ] Responsive images work on all devices
- [ ] Lazy loading functions properly
- [ ] Image sitemap is generated and submitted
- [ ] WebP fallbacks work correctly
- [ ] Critical images load without delay
- [ ] No layout shifts occur during image loading