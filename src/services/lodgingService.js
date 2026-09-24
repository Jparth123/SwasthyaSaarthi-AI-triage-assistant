/**
 * Lodging Knowledge Service
 * Provides realistic accommodation choices across multiple tiers and locations.
 */

export const LODGING_CATALOG = [
  // Tokyo
  {
    id: 'lodge-tko-1',
    name: 'Cerulean Tower Tokyu Hotel',
    type: 'Luxury Hotel',
    city: 'Tokyo',
    neighborhood: 'Shibuya',
    rating: 4.7,
    reviewsCount: 1420,
    pricePerNight: 28000,
    currency: 'JPY',
    tier: 'moderate',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=500&fit=crop',
    amenities: ['Sky View Bar', 'Fitness Center', 'High-Speed Wi-Fi', 'Concierge', 'Direct Airport Limousine Bus'],
    proximity: '5 min walk to Shibuya Crossing & Train Station',
    description: 'Towering above Shibuya with panoramic rooms showcasing the Tokyo skyline and Mount Fuji.',
  },
  {
    id: 'lodge-tko-2',
    name: 'Aman Tokyo (Imperial Palace Otemachi)',
    type: 'Ultra-Luxury Sanctuary',
    city: 'Tokyo',
    neighborhood: 'Otemachi / Ginza',
    rating: 4.9,
    reviewsCount: 650,
    pricePerNight: 140000,
    currency: 'JPY',
    tier: 'ultra-luxury',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop',
    amenities: ['30m Black Granite Pool', 'Traditional Ofuro Basalt Baths', 'Panoramic Zen Lobby', 'Michelin Dining'],
    proximity: 'Adjoining Imperial Palace Gardens and Tokyo Central Station',
    description: 'A monument to modern Japanese design with washi paper lanterns, volcanic rock, and serene water basins.',
  },
  {
    id: 'lodge-tko-3',
    name: 'Hotel Gracery Shinjuku (Godzilla Hotel)',
    type: 'Modern Design Hotel',
    city: 'Tokyo',
    neighborhood: 'Shinjuku',
    rating: 4.5,
    reviewsCount: 2200,
    pricePerNight: 18500,
    currency: 'JPY',
    tier: 'budget',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=500&fit=crop',
    amenities: ['Godzilla Head Terrace', 'Separated Bath & Toilet', 'Free High-Speed Wi-Fi', '24h Front Desk'],
    proximity: 'Heart of Kabukicho, 5 min walk to JR Shinjuku Station',
    description: 'Iconic central Shinjuku hotel featuring the famous life-sized Godzilla head terrace and spotless modern rooms.',
  },

  // Kyoto
  {
    id: 'lodge-kyo-1',
    name: 'The Thousand Kyoto & Zen Spa',
    type: 'Boutique Hotel & Spa',
    city: 'Kyoto',
    neighborhood: 'Shimogyo',
    rating: 4.9,
    reviewsCount: 980,
    pricePerNight: 34000,
    currency: 'JPY',
    tier: 'moderate',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=500&fit=crop',
    amenities: ['Japanese Tea Lounge', 'Zen Meditation Courtyard', 'Luxury Onsen Style Bath', 'Michelin Restaurant'],
    proximity: '2 min walk to Kyoto Shinkansen Station',
    description: 'Minimalist contemporary sanctuary blending warm cedar timber, soft ambient lighting, and Zen gravel gardens.',
  },
  {
    id: 'lodge-kyo-2',
    name: 'Hoshinoya Kyoto (Arashiyama River Ryokan)',
    type: 'Luxury Ryokan',
    city: 'Kyoto',
    neighborhood: 'Arashiyama',
    rating: 5.0,
    reviewsCount: 310,
    pricePerNight: 95000,
    currency: 'JPY',
    tier: 'luxury',
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=500&fit=crop',
    amenities: ['Private Riverboat Transfer', 'Kaiseki Breakfast in Bed', 'Open-Air Hinoki Baths', 'Woodblock Art Salon'],
    proximity: 'Nestled in the tranquil Oi River Gorge, reached only by traditional boat',
    description: 'Centuries-old riverside retreat where guests arrive via gentle wooden boat ride beneath cedar hillsides.',
  },
  {
    id: 'lodge-kyo-3',
    name: 'The Pocket Hotel Kyoto Shijo Karasuma',
    type: 'Boutique Compact Hotel',
    city: 'Kyoto',
    neighborhood: 'Karasuma',
    rating: 4.4,
    reviewsCount: 890,
    pricePerNight: 12000,
    currency: 'JPY',
    tier: 'budget',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=500&fit=crop',
    amenities: ['Keyless Smartphone Entry', 'Shared Modern Lounge', 'Laundromat', 'Luggage Storage'],
    proximity: 'Central Kyoto, 3 min walk to subway and Nishiki Market',
    description: 'Smart, efficient private rooms with private tablets and minimalist Japanese ergonomics.',
  },

  // Osaka
  {
    id: 'lodge-osa-1',
    name: 'Swissôtel Nankai Osaka',
    type: 'Premier Luxury Hotel',
    city: 'Osaka',
    neighborhood: 'Namba',
    rating: 4.8,
    reviewsCount: 1850,
    pricePerNight: 30000,
    currency: 'JPY',
    tier: 'moderate',
    image: 'https://images.unsplash.com/photo-1590559899731-a382571f28d9?w=800&h=500&fit=crop',
    amenities: ['Direct Airport Train Access', 'Indoor Pool & Spa', 'Executive Sky Lounge', 'Dotonbori Walking Distance'],
    proximity: 'Directly atop Namba Station, 8 min walk to Dotonbori',
    description: 'Unrivaled location directly above Nankai Namba terminal with instant access to airport trains and street food alleys.',
  },
  {
    id: 'lodge-osa-2',
    name: 'Conrad Osaka (Your Address in the Sky)',
    type: 'Ultra-Luxury Hotel',
    city: 'Osaka',
    neighborhood: 'Nakanoshima',
    rating: 4.9,
    reviewsCount: 740,
    pricePerNight: 82000,
    currency: 'JPY',
    tier: 'luxury',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=500&fit=crop',
    amenities: ['40th Floor Sky Lobby', 'Sculptural Spiral Staircase', 'Full-Service Spa', 'Panoramic Tub Views'],
    proximity: 'Between Umeda and Namba, riverside business art district',
    description: 'Known as the "Address in the Sky", occupying top floors of Nakanoshima Festival West Tower with breathtaking sunset vistas.',
  },
  {
    id: 'lodge-osa-3',
    name: 'Cross Hotel Osaka',
    type: 'Lifestyle Design Hotel',
    city: 'Osaka',
    neighborhood: 'Shinsaibashi / Dotonbori',
    rating: 4.6,
    reviewsCount: 1600,
    pricePerNight: 19500,
    currency: 'JPY',
    tier: 'budget',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=500&fit=crop',
    amenities: ['Rain Showers & Deep Soaking Tubs', 'Bar Seaside Lounge', 'Prime Street Food Location'],
    proximity: '1 min walk to Dotonbori canal and Glico sign',
    description: 'Chic red-and-white design hotel positioned directly on the threshold of Osaka’s most famous culinary nightlife promenade.',
  },
];

/**
 * Searches and filters lodging catalog based on destination city and budget tier.
 */
export function searchLodging({ city, budgetTier, maxPrice } = {}) {
  let results = [...LODGING_CATALOG];

  if (city) {
    const qCity = city.toLowerCase();
    results = results.filter(l => l.city.toLowerCase().includes(qCity));
  }

  if (budgetTier) {
    results = results.filter(l => l.tier === budgetTier || (budgetTier === 'moderate' && l.tier !== 'ultra-luxury'));
  }

  if (maxPrice && !isNaN(maxPrice)) {
    results = results.filter(l => l.pricePerNight <= maxPrice);
  }

  return results.length > 0 ? results : LODGING_CATALOG.slice(0, 4);
}
