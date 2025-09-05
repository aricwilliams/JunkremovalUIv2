// Coordinate service for geocoding addresses using OpenStreetMap Nominatim API

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodingResult {
  coordinates: Coordinates | null;
  address: string;
  success: boolean;
  error?: string;
}

class CoordinateService {
  private readonly NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
  private readonly REQUEST_DELAY = 1000; // 1 second delay between requests to respect rate limits
  private lastRequestTime = 0;

  /**
   * Get coordinates for a single address
   */
  async getLatLng(address: string): Promise<Coordinates | null> {
    try {
      // Rate limiting - wait if we made a request too recently
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.REQUEST_DELAY) {
        await new Promise(resolve => setTimeout(resolve, this.REQUEST_DELAY - timeSinceLastRequest));
      }

      const encodedAddress = encodeURIComponent(address);
      const url = `${this.NOMINATIM_BASE_URL}?format=json&q=${encodedAddress}&limit=1&addressdetails=1`;
      
      console.log('🌍 Geocoding address:', address);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'JunkRemovalApp/1.0' // Required by Nominatim
        }
      });

      if (!response.ok) {
        throw new Error(`Geocoding request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.lastRequestTime = Date.now();

      if (data && data.length > 0) {
        const result = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
        console.log('✅ Geocoding successful:', result);
        return result;
      }

      console.log('❌ No coordinates found for address:', address);
      return null;
    } catch (error) {
      console.error('❌ Geocoding error for address:', address, error);
      return null;
    }
  }

  /**
   * Get coordinates for multiple addresses with rate limiting
   */
  async getLatLngBatch(addresses: string[]): Promise<GeocodingResult[]> {
    const results: GeocodingResult[] = [];
    
    for (const address of addresses) {
      const coordinates = await this.getLatLng(address);
      results.push({
        coordinates,
        address,
        success: coordinates !== null,
        error: coordinates === null ? 'No coordinates found' : undefined
      });
    }

    return results;
  }

  /**
   * Format address for geocoding
   */
  formatAddressForGeocoding(address: string, city: string, state: string, zipCode: string): string {
    return `${address}, ${city}, ${state} ${zipCode}`.trim();
  }

  /**
   * Check if coordinates are valid
   */
  isValidCoordinates(coords: Coordinates): boolean {
    return (
      typeof coords.lat === 'number' &&
      typeof coords.lng === 'number' &&
      coords.lat >= -90 &&
      coords.lat <= 90 &&
      coords.lng >= -180 &&
      coords.lng <= 180 &&
      !isNaN(coords.lat) &&
      !isNaN(coords.lng)
    );
  }

  /**
   * Calculate distance between two coordinates (in miles)
   */
  calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(coord2.lat - coord1.lat);
    const dLng = this.toRadians(coord2.lng - coord1.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.lat)) * Math.cos(this.toRadians(coord2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const coordinateService = new CoordinateService();
