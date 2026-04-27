import axios from 'axios';
import type { GoogleMapsResult } from '@/types';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

export async function searchGoogleMapsPlaces(
  query: string,
  city: string,
  category: string,
): Promise<{ results: GoogleMapsResult[] }> {
  if (!GOOGLE_MAPS_API_KEY) {
    return generateMockLeads(city, category);
  }

  try {
    // New Places API - Text Search
    const searchRes = await axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      {
        textQuery: category + ' in ' + city + ' India',
        languageCode: 'en',
        regionCode: 'IN',
        maxResultCount: 20,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.location,places.types',
        },
      }
    );

    const places = searchRes.data.places || [];

    const results: GoogleMapsResult[] = places.map((place: any) => ({
      placeId: place.id,
      name: place.displayName?.text || '',
      address: place.formattedAddress || '',
      phone: place.nationalPhoneNumber || undefined,
      website: place.websiteUri || undefined,
      rating: place.rating || undefined,
      reviewCount: place.userRatingCount || undefined,
      category,
      lat: place.location?.latitude,
      lng: place.location?.longitude,
    }));

    return { results };

  } catch (error: any) {
    console.error('New Places API error:', error?.response?.data || error.message);
    // Fall back to mock data
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
    Shops: ['Traders', 'Store', 'Mart', 'Enterprises', 'Retail', 'Bazaar'],
    'Real Estate': ['Properties', 'Realty', 'Builders', 'Constructions', 'Developers', 'Homes'],
    Hotels: ['Hotel', 'Residency', 'Guest House', 'Lodge', 'Suites', 'Inn'],
    Salons: ['Salon', 'Beauty Parlour', 'Hair Studio', 'Spa', 'Unisex Salon', 'Beauty Lounge'],
    default: ['Services', 'Enterprises', 'Solutions', 'Associates', 'Agency', 'Works'],
  };

  const areas: Record<string, string[]> = {
    Chennai: ['T. Nagar', 'Anna Nagar', 'Velachery', 'Porur', 'Tambaram', 'Adyar', 'Nungambakkam', 'Vadapalani', 'Ambattur', 'Perambur', 'Mylapore', 'Chromepet'],
    Bangalore: ['Koramangala', 'Indiranagar', 'Whitefield', 'Jayanagar', 'HSR Layout', 'BTM Layout', 'Marathahalli', 'Electronic City', 'Banashankari'],
    Mumbai: ['Andheri', 'Bandra', 'Dadar', 'Borivali', 'Thane', 'Powai', 'Kurla', 'Malad'],
    Hyderabad: ['Hitech City', 'Gachibowli', 'Secunderabad', 'Dilsukhnagar', 'Mehdipatnam', 'Kukatpally'],
    Pune: ['Kothrud', 'Wakad', 'Hinjewadi', 'Hadapsar', 'Baner', 'Aundh'],
    default: ['Main Road', 'Market Area', 'Bus Stand', 'Old Town', 'New Area', 'Cross Street'],
  };

  const cityAreas = areas[city] || areas.default;
  const sfxList = suffixes[category] || suffixes.default;
  const results: GoogleMapsResult[] = [];
  const count = 25 + Math.floor(Math.random() * 15);

  for (let i = 0; i < count; i++) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = sfxList[Math.floor(Math.random() * sfxList.length)];
    const area = cityAreas[Math.floor(Math.random() * cityAreas.length)];
    const hasWebsite = Math.random() > 0.75;
    const hasPhone = Math.random() > 0.10;

    results.push({
      placeId: 'mock_' + Date.now() + '_' + i,
      name: prefix + ' ' + suffix,
      address: Math.floor(Math.random() * 200 + 1) + ', ' + area + ', ' + city,
      phone: hasPhone ? '+91 ' + Math.floor(6000000000 + Math.random() * 3999999999) : undefined,
      website: hasWebsite ? 'https://www.' + prefix.toLowerCase() + suffix.toLowerCase().replace(/\s/g, '') + '.com' : undefined,
      rating: +(2 + Math.random() * 3).toFixed(1),
      reviewCount: Math.floor(Math.random() * 150),
      category,
      lat: 13.0827 + (Math.random() - 0.5) * 0.3,
      lng: 80.2707 + (Math.random() - 0.5) * 0.3,
    });
  }

  return { results };
}