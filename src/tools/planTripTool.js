/**
 * Plan Trip Tool
 * Synthesizes a complete multi-day itinerary with realistic days, items, lodging, and transit.
 */

import { findDestination, getCuratedActivities } from '../services/destinationService.js';
import { searchLodging } from '../services/lodgingService.js';
import { searchTransit } from '../services/transitService.js';
import { getWeatherForecastForDay } from '../services/weatherService.js';
import { ITEM_TYPES, BOOKING_STATUS, TRIP_PACES } from '../types/stateTypes.js';

export const planTripTool = {
  name: 'planTripTool',
  description: 'Generates a coherent, multi-day itinerary tailored to destination, dates, budget, and interests.',
  
  async execute(input, _currentState) {
    const {
      destination: destQuery = 'Japan',
      durationDays = 7,
      travelers = { count: 2, adults: 2, children: 0, type: 'couple' },
      budget = { tier: 'moderate', currency: 'JPY' },
      pace = TRIP_PACES.MODERATE,
      interests = ['Culture & Temples', 'Culinary & Street Food', 'Gardens', 'High-Speed Rail'],
      season = 'autumn',
    } = input;

    const destMeta = findDestination(destQuery);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 30); // 30 days from now

    // Determine cities based on duration & destination
    let cityDistribution = [];
    if (/japan/i.test(destMeta.name)) {
      if (durationDays <= 3) {
        cityDistribution = Array(durationDays).fill('Tokyo');
      } else if (durationDays <= 5) {
        cityDistribution = ['Tokyo', 'Tokyo', 'Kyoto', 'Kyoto', 'Osaka'].slice(0, durationDays);
      } else if (durationDays <= 7) {
        cityDistribution = ['Tokyo', 'Tokyo', 'Kyoto', 'Kyoto', 'Nara & Osaka', 'Osaka', 'Osaka'];
      } else {
        cityDistribution = ['Tokyo', 'Tokyo', 'Tokyo', 'Hakone & Fuji', 'Kyoto', 'Kyoto', 'Kyoto', 'Nara', 'Osaka', 'Osaka'].slice(0, durationDays);
      }
    } else {
      cityDistribution = Array(durationDays).fill(destMeta.cities[0] || destMeta.name);
    }

    const availableActivities = getCuratedActivities(destMeta.name, interests);
    const days = [];
    let actIndex = 0;

    for (let d = 1; d <= durationDays; d++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + (d - 1));
      const dateStr = dayDate.toISOString().split('T')[0];
      const city = cityDistribution[d - 1] || destMeta.name;
      const weather = getWeatherForecastForDay(dateStr, city);

      // Day items based on pace
      const itemsCount = pace === TRIP_PACES.RELAXED ? 2 : (pace === TRIP_PACES.PACKED ? 4 : 3);
      const dayItems = [];

      // Morning item
      const act1 = availableActivities[actIndex % availableActivities.length];
      actIndex++;
      dayItems.push({
        id: `item-${d}-1`,
        type: ITEM_TYPES.ACTIVITY,
        title: act1.title,
        description: act1.description,
        startTime: '09:00',
        endTime: '11:30',
        durationMinutes: 150,
        cost: act1.cost,
        location: act1.location,
        bookingStatus: BOOKING_STATUS.CONFIRMED,
        tags: act1.tags,
        rating: act1.rating,
      });

      // Afternoon item
      const act2 = availableActivities[actIndex % availableActivities.length];
      actIndex++;
      dayItems.push({
        id: `item-${d}-2`,
        type: ITEM_TYPES.ACTIVITY,
        title: act2.title,
        description: act2.description,
        startTime: '13:30',
        endTime: '16:00',
        durationMinutes: 150,
        cost: act2.cost,
        location: act2.location,
        bookingStatus: BOOKING_STATUS.RECOMMENDED,
        tags: act2.tags,
        rating: act2.rating,
      });

      // Evening meal or activity if moderate/packed
      if (itemsCount >= 3) {
        dayItems.push({
          id: `item-${d}-3`,
          type: ITEM_TYPES.MEAL,
          title: `Evening Dining & Night Market in ${city}`,
          description: `Experience renowned regional specialties and vibrant evening atmosphere.`,
          startTime: '18:30',
          endTime: '20:30',
          durationMinutes: 120,
          cost: 4500,
          location: { name: `${city} Central`, address: city, lat: destMeta.coordinates.lat, lng: destMeta.coordinates.lng },
          bookingStatus: BOOKING_STATUS.RECOMMENDED,
          tags: ['Culinary', 'Dining'],
          rating: 4.8,
        });
      }

      days.push({
        dayNumber: d,
        date: dateStr,
        title: `Explore ${city}: Highlights & Cultural Wonders`,
        location: city,
        weather,
        items: dayItems,
      });
    }

    // Recommended lodging
    const lodging = searchLodging({ budgetTier: budget.tier || 'moderate' }).map((l, idx) => ({
      ...l,
      isSelected: idx < 3,
    }));

    // Transit
    const transit = searchTransit();

    // Budget computation
    const totalDays = durationDays;
    const estimatedDailyCost = destMeta.avgDailyCostJPY || 35000;
    const baseTotal = budget.amount || (estimatedDailyCost * totalDays * (travelers.count || 2) * 0.7);
    const spentEst = Math.round(baseTotal * 0.72);

    const newTrip = {
      id: `trip-${Date.now()}`,
      title: `${destMeta.name}: ${durationDays}-Day Curated Journey`,
      status: 'planning',
      destination: {
        name: destMeta.name,
        country: destMeta.country,
        region: destMeta.region,
        coordinates: destMeta.coordinates,
        timezone: destMeta.timezone,
        currency: destMeta.currency,
        heroImage: destMeta.heroImage,
      },
      dates: {
        startDate: days[0]?.date || '2026-10-10',
        endDate: days[days.length - 1]?.date || '2026-10-16',
        durationDays,
        isFlexible: true,
        season,
      },
      travelers,
      budget: {
        total: Math.round(baseTotal),
        spent: spentEst,
        currency: destMeta.currency,
        tier: budget.tier || 'moderate',
        breakdown: {
          transport: Math.round(spentEst * 0.22),
          lodging: Math.round(spentEst * 0.45),
          activities: Math.round(spentEst * 0.18),
          dining: Math.round(spentEst * 0.15),
          buffer: Math.round(baseTotal - spentEst),
        },
      },
      preferences: {
        pace,
        interests,
        dietary: ['No Restrictions'],
        accommodationTypes: ['Ryokan', 'Boutique Hotel'],
        transitPreferences: ['Shinkansen Bullet Train', 'Metro'],
      },
      constraints: {
        mustSee: ['Iconic Landmarks', 'Cultural Highlights'],
        avoid: ['Rushed transit itineraries'],
        maxTransitHoursPerDay: 3.5,
      },
    };

    return {
      trip: newTrip,
      itinerary: { days },
      lodging,
      transit,
      summary: `Synthesized comprehensive ${durationDays}-day itinerary for ${destMeta.name}.`,
    };
  },
};
