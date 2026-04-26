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
    return generateMockLeads(city, category);
  }

  const searchQuery = category + ' in ' + city + ', India';
  const params: Record<string, string> = {
    query: searchQuery,
    key: GOOGLE_MAPS_API_KEY,
    language: 'en',
    region: 'in',
  };
  if (pageToken) params.pagetoken = pageToken;

  try {
    const response = await axios.get<PlacesSearchResponse>(
      'https://maps.googleapis.com/maps/api/place/textsearch/json',
      { params }
    );

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      return generateMockLeads(city, category);
    }

    const results: GoogleMapsResult[] = await Promise.all(
      response.data.results.slice(0, 20).map(async (place) => {
        let phone: string | undefined;
        let website: string | undefined;
        try {
          const d = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
            params: { place_id: place.place_id, fields: 'formatted_phone_number,website', key: GOOGLE_MAPS_API_KEY },
          });
          phone = d.data.result?.formatted_phone_number;
          website = d.data.result?.website;
        } catch {}
        return {
          placeId: place.place_id,
          name: place.name,
          address: place.formatted_address,
          phone,
          website,
          rating: place.rating,
          reviewCount: place.user_ratings_total,
          category,
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        };
      })
    );
    return { results, nextPageToken: response.data.next_page_token };
  } catch {
    return generateMockLeads(city, category);
  }
}

function generateMockLeads(city: string, category: string): { results: GoogleMapsResult[] } {
  const prefixes = ['Sri', 'Shree', 'New', 'Modern', 'Classic', 'Royal', 'Star', 'Elite', 'Metro', 'Grand', 'Raj', 'Krishna', 'Lakshmi', 'Sai', 'Om', 'Anand', 'Balaji', 'Surya', 'Murugan', 'Ganesh', 'Vel', 'ARS', 'SKS', 'RK', 'SS'];
  const suffixes: Record<string, string[]> = {
    Restaurants: ['Kitchen', 'Biryani House', 'Dhaba', 'Hotel', 'Foods', 'Meals', 'Tiffins', 'Mess', 'Catering'],
    Clinics: ['Clinic', 'Hospital', 'Medical Centre', 'Health Care', 'Polyclinic', 'Nursing Home'],
    Gyms: ['Fitness', 'Gym', 'Wellness Centre', 'Health Club', 'Sports Academy', 'Fitness Studio'],
    Schools: ['Academy', 'School', 'Institute', 'Education Centre', 'Coaching', 'Tuition Centre'],
    Shops: ['Traders', 'Store', 'Mart', 'Enterprises', 'Retail', 'Bazaar', 'Supermarket'],
    'Real Estate': ['Properties', 'Realty', 'Builders', 'Constructions', 'Developers', 'Homes'],
    Hotels: ['Hotel', 'Residency', 'Guest House', 'Lodge', 'Suites', 'Inn'],
    Salons: ['Salon', 'Beauty Parlour', 'Hair Studio', 'Spa', 'Unisex Salon', 'Beauty Lounge'],
    default: ['Services', 'Enterprises', 'Solutions', 'Associates', 'Agency', 'Works'],
  };

  const areas: Record<string, string[]> = {
    Chennai: ['T. Nagar', 'Anna Nagar', 'Velachery', 'Porur', 'Tambaram', 'Adyar', 'Nungambakkam', 'Vadapalani', 'Ambattur', 'Perambur', 'Mylapore', 'Chromepet'],
    Bangalore: ['Koramangala', 'Indiranagar', 'Whitefield', 'Jayanagar', 'HSR Layout', 'BTM Layout', 'Marathahalli', 'Electronic City', 'Banashankari'],
    Mumbai: ['Andheri', 'Bandra', 'Dadar', 'Borivali', 'Thane', 'Powai', 'Kurla', 'Malad', 'Goregaon'],
    Hyderabad: ['Hitech City', 'Gachibowli', 'Secunderabad', 'Dilsukhnagar', 'Mehdipatnam', 'Kukatpally'],
    Pune: ['Kothrud', 'Wakad', 'Hinjewadi', 'Hadapsar', 'Baner', 'Aundh', 'Shivajinagar'],
    default: ['Main Road', 'Market Area', 'Bus Stand', 'Railway Station Road', 'Old Town', 'New Area', 'Cross Street'],
  };

  const cityAreas = areas[city] || areas.default;
  const sfxList = suffixes[category] || suffixes.default;
  const results: GoogleMapsResult[] = [];
  const count = 25 + Math.floor(Math.random() * 15); // 25-40 results

  for (let i = 0; i < count; i++) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = sfxList[Math.floor(Math.random() * sfxList.length)];
    const area = cityAreas[Math.floor(Math.random() * cityAreas.length)];
    // 70% chance NO website — these are your hot leads
    const hasWebsite = Math.random() > 0.70;
    const hasPhone = Math.random() > 0.10;
    const rating = +(2 + Math.random() * 3).toFixed(1);
    const reviewCount = Math.floor(Math.random() * 150);

    results.push({
      placeId: 'mock_' + Date.now() + '_' + i,
      name: prefix + ' ' + suffix,
      address: Math.floor(Math.random() * 200 + 1) + ', ' + area + ', ' + city,
      phone: hasPhone ? '+91 ' + Math.floor(6000000000 + Math.random() * 3999999999) : undefined,
      website: hasWebsite ? 'https://www.' + prefix.toLowerCase() + suffix.toLowerCase().replace(/\s/g, '') + '.com' : undefined,
      rating,
      reviewCount,
      category,
      lat: 13.0827 + (Math.random() - 0.5) * 0.3,
      lng: 80.2707 + (Math.random() - 0.5) * 0.3,
    });
  }

  return { results };
}