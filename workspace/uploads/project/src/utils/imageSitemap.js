// Image Sitemap Generator for SEO

export class ImageSitemapGenerator {
  constructor(baseUrl = 'https://streamflix.com') {
    this.baseUrl = baseUrl;
    this.images = [];
  }

  // Add image to sitemap
  addImage(url, caption, title, location = this.baseUrl) {
    this.images.push({
      url,
      caption,
      title,
      location
    });
  }

  // Add movie images to sitemap
  addMovieImages(movie, movieUrl) {
    if (movie.poster_path) {
      this.addImage(
        `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        `${movie.title} (${new Date(movie.release_date).getFullYear()}) - Official Movie Poster`,
        `${movie.title} Poster`,
        movieUrl
      );
    }

    if (movie.backdrop_path) {
      this.addImage(
        `https://image.tmdb.org/t/p/w1920_and_h800_multi_faces${movie.backdrop_path}`,
        `${movie.title} - Movie Scene Background Image`,
        `${movie.title} Backdrop`,
        movieUrl
      );
    }
  }

  // Add TV show images to sitemap
  addTVImages(show, showUrl) {
    if (show.poster_path) {
      this.addImage(
        `https://image.tmdb.org/t/p/w500${show.poster_path}`,
        `${show.name} (${new Date(show.first_air_date).getFullYear()}) - Official TV Show Poster`,
        `${show.name} Poster`,
        showUrl
      );
    }

    if (show.backdrop_path) {
      this.addImage(
        `https://image.tmdb.org/t/p/w1920_and_h800_multi_faces${show.backdrop_path}`,
        `${show.name} - TV Show Scene Background Image`,
        `${show.name} Backdrop`,
        showUrl
      );
    }
  }

  // Add person images to sitemap
  addPersonImages(person, personUrl) {
    if (person.profile_path) {
      this.addImage(
        `https://image.tmdb.org/t/p/w500${person.profile_path}`,
        `${person.name} - Professional Headshot Photo`,
        `${person.name} Profile Photo`,
        personUrl
      );
    }
  }

  // Generate XML sitemap
  generateXML() {
    const groupedImages = this.groupImagesByLocation();
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

    Object.entries(groupedImages).forEach(([location, images]) => {
      xml += `  <url>
    <loc>${location}</loc>
`;
      
      images.forEach(image => {
        xml += `    <image:image>
      <image:loc>${this.escapeXML(image.url)}</image:loc>
      <image:caption>${this.escapeXML(image.caption)}</image:caption>
      <image:title>${this.escapeXML(image.title)}</image:title>
    </image:image>
`;
      });
      
      xml += `  </url>
`;
    });

    xml += `</urlset>`;
    return xml;
  }

  // Group images by their page location
  groupImagesByLocation() {
    const grouped = {};
    
    this.images.forEach(image => {
      if (!grouped[image.location]) {
        grouped[image.location] = [];
      }
      grouped[image.location].push(image);
    });
    
    return grouped;
  }

  // Escape XML special characters
  escapeXML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Generate sitemap for current content
  async generateFromContent(movies = [], tvShows = [], people = []) {
    // Add static images
    this.addImage(
      `${this.baseUrl}/imgs/big_logo.png`,
      'StreamFlix - Premium Movie and TV Show Streaming Platform Main Logo',
      'StreamFlix Main Logo',
      this.baseUrl
    );

    this.addImage(
      `${this.baseUrl}/imgs/small_logo.png`,
      'StreamFlix Navigation Header Logo',
      'StreamFlix Header Logo',
      this.baseUrl
    );

    // Add language flag images
    const languages = [
      { code: 'US', name: 'English' },
      { code: 'ES', name: 'Spanish' },
      { code: 'FR', name: 'French' },
      { code: 'DE', name: 'German' },
      { code: 'IT', name: 'Italian' }
    ];

    languages.forEach(lang => {
      this.addImage(
        `${this.baseUrl}/imgs/flags/${lang.code}.png`,
        `${lang.name} Language Flag - Language Selection Option`,
        `${lang.name} Language Selection`,
        this.baseUrl
      );
    });

    // Add movie images
    movies.forEach(movie => {
      const movieUrl = `${this.baseUrl}/movie/${movie.id}`;
      this.addMovieImages(movie, movieUrl);
    });

    // Add TV show images
    tvShows.forEach(show => {
      const showUrl = `${this.baseUrl}/tv/${show.id}`;
      this.addTVImages(show, showUrl);
    });

    // Add person images
    people.forEach(person => {
      const personUrl = `${this.baseUrl}/person/${person.id}`;
      this.addPersonImages(person, personUrl);
    });

    return this.generateXML();
  }

  // Save sitemap to file (for build process)
  async saveSitemap(content, filename = 'sitemap-images.xml') {
    if (typeof window !== 'undefined') {
      // Browser environment - download file
      const blob = new Blob([content], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Node.js environment - write to file
      const fs = require('fs').promises;
      await fs.writeFile(`public/${filename}`, content, 'utf8');
    }
  }
}

// Utility function to generate image sitemap
export async function generateImageSitemap(contentData) {
  const generator = new ImageSitemapGenerator();
  const xml = await generator.generateFromContent(
    contentData.movies || [],
    contentData.tvShows || [],
    contentData.people || []
  );
  
  return xml;
}

// Auto-generate sitemap on build
export function setupImageSitemapGeneration() {
  if (typeof window !== 'undefined') {
    // Browser environment - generate on demand
    window.generateImageSitemap = generateImageSitemap;
  }
}