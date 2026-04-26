// src/lib/google-maps.ts
import axios from 'axios';
import type { GoogleMapsResult } from '@/types';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

interface PlacesSearchResponse {
  results: Array<{
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: { location: { lat: number; lng: number } };
    rating?: number;
    user_ratings_total?: number;
    types: string[];
    formatted_phone_number?: string;
    website?: string;
  }>;
  next_page_token?: string;
  status: string;
}

export async function searchGoogleMapsPlaces(
  query: string,
  city: string,
  category: string,
  pageToken?: string
): Promise<{ results: GoogleMapsResult[]; nextPageToken?: string }> {
  if (!GOOGLE_MAPS_API_KEY) {
    // Return mock data when no API key
    return generateMockLeads(query, city, category);
  }

  const searchQuery = `${category} in ${city}, India`;

  const params: Record<string, string> = {
    query: searchQuery,
    key: GOOGLE_MAPS_API_KEY,
    language: 'en',
    region: 'in',
  };

  if (pageToken) {
    params.pagetoken = pageToken;
  }

  try {
    const response = await axios.get<PlacesSearchResponse>(
      'https://maps.googleapis.com/maps/api/place/textsearch/json',
      { params }
    );

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      console.error('Google Maps API error:', response.data.status);
      return { results: [] };
    }

    const results: GoogleMapsResult[] = await Promise.all(
      response.data.results.slice(0, 10).map(async (place) => {
        // Get details for phone and website
        let phone: string | undefined;
        let website: string | undefined;

        try {
          const detailsResp = await axios.get(
            'https://maps.googleapis.com/maps/api/place/details/json',
            {
              params: {
                place_id: place.place_id,
                fields: 'formatted_phone_number,website',
                key: GOOGLE_MAPS_API_KEY,
              },
            }
          );
          phone = detailsResp.data.result?.formatted_phone_number;
          website = detailsResp.data.result?.website;
        } catch {
          // ignore detail errors
        }

        return {
          placeId: place.place_id,
          name: place.name,
          address: place.formatted_address,
          phone,
          website,
          rating: place.rating,
          reviewCount: place.user_ratings_total,
          category: place.types[0]?.replace(/_/g, ' ') || category,
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        };
      })
    );

    return {
      results,
      nextPageToken: response.data.next_page_token,
    };
  } catch (error) {
    console.error('Google Maps search error:', error);
    return { results: [] };
  }
}

function generateMockLeads(
  query: string,
  city: string,
  category: string
): { results: GoogleMapsResult[]; nextPageToken?: string } {
  const businessPrefixes = [
    'Sri', 'Shree', 'New', 'Modern', 'Classic', 'Royal', 'Star', 'Elite', 'Premium', 'City',
    'Metro', 'Grand', 'Raj', 'Krishna', 'Lakshmi', 'Sai', 'Om', 'Anand', 'Balaji', 'Surya',
  ];
  const businessSuffixes: Record<string, string[]> = {
    Restaurants: ['Kitchen', 'Biryani House', 'Dhaba', 'Hotel', 'Foods', 'Meals', 'Tiffins'],
    Clinics: ['Clinic', 'Hospital', 'Medical Centre', 'Health Care', 'Polyclinic'],
    Gyms: ['Fitness', 'Gym', 'Wellness Centre', 'Health Club', 'Sports Academy'],
    Schools: ['Academy', 'School', 'Institute', 'Education Centre', 'Coaching'],
    Shops: ['Traders', 'Store', 'Mart', 'Enterprises', 'Retail'],
    'Real Estate': ['Properties', 'Realty', 'Builders', 'Constructions', 'Developers'],
    Hotels: ['Hotel', 'Residency', 'Guest House', 'Lodge', 'Suites'],
    Salons: ['Salon', 'Beauty Parlour', 'Hair Studio', 'Spa', 'Unisex Salon'],
    default: ['Services', 'Enterprises', 'Solutions', 'Associates', 'Agency'],
  };

  const areas: Record<string, string[]> = {
    Chennai: ['T. Nagar', 'Anna Nagar', 'Velachery', 'Porur', 'Tambaram', 'Adyar', 'Nungambakkam'],
    Bangalore: ['Koramangala', 'Indiranagar', 'Whitefield', 'Jayanagar', 'HSR Layout', 'BTM Layout'],
    Mumbai: ['Andheri', 'Bandra', 'Dadar', 'Borivali', 'Thane', 'Powai'],
    default: ['Main Road', 'Market Area', 'Bus Stand', 'Railway Station Road', 'Sector 12'],
  };

  const cityAreas = areas[city] || areas.default;
  const suffixes = businessSuffixes[category] || businessSuffixes.default;
  const results: GoogleMapsResult[] = [];

  const count = 8 + Math.floor(Math.random() * 7); // 8–14 results

  for (let i = 0; i < count; i++) {
    const prefix = businessPrefixes[Math.floor(Math.random() * businessPrefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const area = cityAreas[Math.floor(Math.random() * cityAreas.length)];
    const hasWebsite = Math.random() > 0.55; // ~45% have no website
    const hasPhone = Math.random() > 0.15;
    const rating = +(2 + Math.random() * 3).toFixed(1);
    const reviewCount = Math.floor(Math.random() * 200);

    results.push({
      placeId: `mock_${Date.now()}_${i}`,
      name: `${prefix} ${suffix}`,
      address: `${Math.floor(Math.random() * 200) + 1}, ${area}, ${city}`,
      phone: hasPhone ? `+91 ${Math.floor(6000000000 + Math.random() * 3999999999)}` : undefined,
      website: hasWebsite ? `https://www.${prefix.toLowerCase()}${suffix.toLowerCase().replace(/\s/g, '')}.com` : undefined,
      rating,
      reviewCount,
      category,
      lat: 13.0827 + (Math.random() - 0.5) * 0.3,
      lng: 80.2707 + (Math.random() - 0.5) * 0.3,
    });
  }

  return { results };
}
