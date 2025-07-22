// TMDB API Service with caching, error handling, and retry logic
class TMDBApiService {
  constructor() {
    this.baseURL = 'https://api.themoviedb.org/3';
    this.apiKey = 'b7cd3340a794e5a2f35e3abb820b497f';
    this.imageBaseURL = 'https://image.tmdb.org/t/p';
    this.cache = new Map();
    this.cacheExpiration = 5 * 60 * 1000; // 5 minutes
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  // Cache management
  getCacheKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    return `${endpoint}_${JSON.stringify(sortedParams)}`;
  }

  isValidCache(cacheEntry) {
    return cacheEntry && (Date.now() - cacheEntry.timestamp) < this.cacheExpiration;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getCache(key) {
    const cacheEntry = this.cache.get(key);
    return this.isValidCache(cacheEntry) ? cacheEntry.data : null;
  }

  clearCache() {
    this.cache.clear();
  }

  // Retry logic with exponential backoff
  async withRetry(fn, retries = this.maxRetries) {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        await this.delay(this.retryDelay * (this.maxRetries - retries + 1));
        return this.withRetry(fn, retries - 1);
      }
      throw error;
    }
  }

  isRetryableError(error) {
    return error.status >= 500 || error.status === 429 || !error.status;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Core API request method
  async request(endpoint, params = {}) {
    const cacheKey = this.getCacheKey(endpoint, params);
    const cachedData = this.getCache(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    const queryParams = new URLSearchParams({
      api_key: this.apiKey,
      ...params
    });

    const url = `${this.baseURL}${endpoint}?${queryParams}`;

    const response = await this.withRetry(async () => {
      const res = await fetch(url);
      
      if (!res.ok) {
        const error = new Error(`TMDB API Error: ${res.statusText}`);
        error.status = res.status;
        error.response = res;
        throw error;
      }
      
      return res.json();
    });

    this.setCache(cacheKey, response);
    return response;
  }

  // Image URL utilities
  getImageURL(path, size = 'w500') {
    if (!path) return null;
    return `${this.imageBaseURL}/${size}${path}`;
  }

  getMultipleImageSizes(path) {
    if (!path) return {};
    return {
      small: this.getImageURL(path, 'w200'),
      medium: this.getImageURL(path, 'w500'),
      large: this.getImageURL(path, 'w780'),
      original: this.getImageURL(path, 'original')
    };
  }

  // Utility methods
  formatRating(rating) {
    if (!rating) return { stars: 0, text: 'N/A' };
    const stars = Math.round(rating / 2);
    return {
      stars,
      text: rating.toFixed(1),
      percentage: Math.round(rating * 10)
    };
  }

  formatRuntime(minutes) {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  formatDate(dateString, format = 'year') {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    
    switch (format) {
      case 'year':
        return date.getFullYear().toString();
      case 'full':
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'short':
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      default:
        return date.getFullYear().toString();
    }
  }

  formatCurrency(amount) {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // API Endpoints
  async getTrending(mediaType = 'movie', timeWindow = 'week', page = 1) {
    return this.request(`/trending/${mediaType}/${timeWindow}`, { page });
  }

  async getPopular(mediaType = 'movie', page = 1) {
    return this.request(`/${mediaType}/popular`, { page });
  }

  async getTopRated(mediaType = 'movie', page = 1) {
    return this.request(`/${mediaType}/top_rated`, { page });
  }

  async getUpcoming(page = 1) {
    return this.request('/movie/upcoming', { page });
  }

  async getNowPlaying(page = 1) {
    return this.request('/movie/now_playing', { page });
  }

  async getLatestMovies(page = 1) {
    return this.request('/movie/latest', { page });
  }

  async getAiringToday(page = 1) {
    return this.request('/tv/airing_today', { page });
  }

  async getOnTheAir(page = 1) {
    return this.request('/tv/on_the_air', { page });
  }

  async getMovieDetails(id) {
    return this.request(`/movie/${id}`, {
      append_to_response: 'credits,videos,similar,recommendations,translations,reviews,images,keywords,external_ids'
    });
  }

  async getTVDetails(id) {
    return this.request(`/tv/${id}`, {
      append_to_response: 'credits,videos,similar,recommendations,translations,reviews,images,keywords,external_ids,season/1'
    });
  }

  async getSeasonDetails(tvId, seasonNumber) {
    return this.request(`/tv/${tvId}/season/${seasonNumber}`, {
      append_to_response: 'credits,videos,images'
    });
  }

  async getEpisodeDetails(tvId, seasonNumber, episodeNumber) {
    return this.request(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`, {
      append_to_response: 'credits,videos,images'
    });
  }

  async searchMovies(query, page = 1) {
    return this.request('/search/movie', { query, page });
  }

  async searchMulti(query, page = 1) {
    return this.request('/search/multi', { query, page });
  }

  async searchTV(query, page = 1) {
    return this.request('/search/tv', { query, page });
  }

  async searchPerson(query, page = 1) {
    return this.request('/search/person', { query, page });
  }

  async searchCompany(query, page = 1) {
    return this.request('/search/company', { query, page });
  }

  async searchKeyword(query, page = 1) {
    return this.request('/search/keyword', { query, page });
  }

  async getGenres(mediaType = 'movie') {
    return this.request(`/genre/${mediaType}/list`);
  }

  async getMoviesByGenre(genreId, page = 1, sortBy = 'popularity.desc') {
    return this.request('/discover/movie', {
      with_genres: genreId,
      page,
      sort_by: sortBy
    });
  }

  async getTVByGenre(genreId, page = 1, sortBy = 'popularity.desc') {
    return this.request('/discover/tv', {
      with_genres: genreId,
      page,
      sort_by: sortBy
    });
  }

  async getPersonDetails(id) {
    return this.request(`/person/${id}`, {
      append_to_response: 'movie_credits,tv_credits,images,external_ids,combined_credits'
    });
  }

  async getPersonMovieCredits(id) {
    return this.request(`/person/${id}/movie_credits`);
  }

  async getPersonTVCredits(id) {
    return this.request(`/person/${id}/tv_credits`);
  }

  async getPersonCombinedCredits(id) {
    return this.request(`/person/${id}/combined_credits`);
  }

  async getConfiguration() {
    return this.request('/configuration');
  }

  async getCountries() {
    return this.request('/configuration/countries');
  }

  async getLanguages() {
    return this.request('/configuration/languages');
  }

  async getTimezones() {
    return this.request('/configuration/timezones');
  }

  // Collections
  async getCollection(id) {
    return this.request(`/collection/${id}`, {
      append_to_response: 'images'
    });
  }

  // Networks
  async getNetwork(id) {
    return this.request(`/network/${id}`);
  }

  // Companies
  async getCompany(id) {
    return this.request(`/company/${id}`);
  }

  // Keywords
  async getKeyword(id) {
    return this.request(`/keyword/${id}`);
  }

  async getMoviesByKeyword(keywordId, page = 1) {
    return this.request('/discover/movie', {
      with_keywords: keywordId,
      page
    });
  }

  // Reviews
  async getMovieReviews(id, page = 1) {
    return this.request(`/movie/${id}/reviews`, { page });
  }

  async getTVReviews(id, page = 1) {
    return this.request(`/tv/${id}/reviews`, { page });
  }

  // External IDs
  async getMovieExternalIds(id) {
    return this.request(`/movie/${id}/external_ids`);
  }

  async getTVExternalIds(id) {
    return this.request(`/tv/${id}/external_ids`);
  }

  async getPersonExternalIds(id) {
    return this.request(`/person/${id}/external_ids`);
  }

  // Advanced search with filters
  async advancedSearch(filters = {}) {
    const {
      query,
      year,
      genre,
      rating_gte,
      rating_lte,
      sort_by = 'popularity.desc',
      page = 1
    } = filters;

    if (query) {
      return this.searchMovies(query, page);
    }

    const params = {
      page,
      sort_by,
      ...(year && { year }),
      ...(genre && { with_genres: genre }),
      ...(rating_gte && { 'vote_average.gte': rating_gte }),
      ...(rating_lte && { 'vote_average.lte': rating_lte })
    };

    return this.request('/discover/movie', params);
  }

  // Advanced TV search
  async advancedTVSearch(filters = {}) {
    const {
      query,
      first_air_date_year,
      genre,
      rating_gte,
      rating_lte,
      sort_by = 'popularity.desc',
      page = 1
    } = filters;

    if (query) {
      return this.searchTV(query, page);
    }

    const params = {
      page,
      sort_by,
      ...(first_air_date_year && { first_air_date_year }),
      ...(genre && { with_genres: genre }),
      ...(rating_gte && { 'vote_average.gte': rating_gte }),
      ...(rating_lte && { 'vote_average.lte': rating_lte })
    };

    return this.request('/discover/tv', params);
  }

  // Watchlist and favorites (would integrate with backend)
  async addToWatchlist(mediaType, mediaId) {
    // This would integrate with your backend/authentication system
    console.log(`Adding ${mediaType} ${mediaId} to watchlist`);
  }

  async removeFromWatchlist(mediaType, mediaId) {
    // This would integrate with your backend/authentication system
    console.log(`Removing ${mediaType} ${mediaId} from watchlist`);
  }

  async addToFavorites(mediaType, mediaId) {
    // This would integrate with your backend/authentication system
    console.log(`Adding ${mediaType} ${mediaId} to favorites`);
  }

  async removeFromFavorites(mediaType, mediaId) {
    // This would integrate with your backend/authentication system
    console.log(`Removing ${mediaType} ${mediaId} from favorites`);
  }
}

export default new TMDBApiService();