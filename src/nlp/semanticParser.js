/**
 * Semantic Parser & Intent Resolution Engine
 * Deterministic, robust, zero-dependency hybrid NLP parser.
 * Extracts intent, entities, temporal constraints, quantitative constraints, and delta modifications.
 */

import { INTENT_ACTIONS } from '../types/nlpTypes.js';
import { DESTINATION_DATABASE } from '../services/destinationService.js';

export function parseNaturalLanguage(input, currentState) {
  if (!input || typeof input !== 'string') {
    return {
      action: INTENT_ACTIONS.UNKNOWN,
      confidence: 0,
      rawPrompt: '',
      entities: {},
      toolTrace: [],
    };
  }

  const prompt = input.trim();
  const lower = prompt.toLowerCase();

  // 1. Undo / Redo / Reset
  if (/^(undo|revert|go back|step back|undo that|cancel last)$/i.test(lower) || lower.includes('undo last')) {
    return {
      action: INTENT_ACTIONS.UNDO,
      confidence: 0.99,
      rawPrompt: prompt,
      entities: {},
    };
  }

  if (/^(redo|step forward|redo that)$/i.test(lower) || lower.includes('redo last')) {
    return {
      action: INTENT_ACTIONS.REDO,
      confidence: 0.99,
      rawPrompt: prompt,
      entities: {},
    };
  }

  if (/(reset|start over|clear plan|new trip|clear all)/i.test(lower) && !lower.includes('filter')) {
    return {
      action: INTENT_ACTIONS.RESET,
      confidence: 0.95,
      rawPrompt: prompt,
      entities: {},
    };
  }

  // 2. Optimization / Route
  if (/(optimize|route|reorder stops|avoid backtracking|efficient path|fix sequence|tsp)/i.test(lower)) {
    return {
      action: INTENT_ACTIONS.OPTIMIZE_ROUTE,
      confidence: 0.92,
      rawPrompt: prompt,
      entities: {},
    };
  }

  // 3. Budget Recalculation or Inquiries
  if (/(recalculate budget|budget breakdown|how much (spent|cost|left)|expense report|cut budget|increase budget)/i.test(lower)) {
    const budgetAmount = extractBudgetAmount(lower);
    return {
      action: INTENT_ACTIONS.CALCULATE_BUDGET,
      confidence: 0.90,
      rawPrompt: prompt,
      entities: {
        budget: budgetAmount,
      },
    };
  }

  // 4. Lodging Searches & Switches
  if (/(find|search|change|switch|recommend|show) (hotel|hotels|ryokan|ryokans|stay|stays|accommodation|resort)/i.test(lower) ||
      /(ryokan|luxury hotel|budget hotel|where to stay)/i.test(lower)) {
    const tier = extractBudgetTier(lower);
    const targetCity = extractCity(lower);
    return {
      action: INTENT_ACTIONS.SEARCH_LODGING,
      confidence: 0.88,
      rawPrompt: prompt,
      entities: {
        city: targetCity,
        tier: tier || 'moderate',
      },
    };
  }

  // 5. Transit Searches
  if (/(shinkansen|bullet train|train|flight|transit|transport|subway|express train|how to get from)/i.test(lower) && 
      !lower.startsWith('add') && !lower.startsWith('remove')) {
    return {
      action: INTENT_ACTIONS.SEARCH_TRANSIT,
      confidence: 0.88,
      rawPrompt: prompt,
      entities: {
        transitMode: /shinkansen|bullet/i.test(lower) ? 'High-Speed Rail' : 'Train',
      },
    };
  }

  // 6. Removing Activities or Days
  if (/^(remove|delete|drop|cancel|eliminate)\b/i.test(lower) || lower.includes('remove from day') || lower.includes('delete from day')) {
    const targetDay = extractTargetDay(lower);
    const activityName = extractActivityNameForRemoval(lower);
    return {
      action: INTENT_ACTIONS.REMOVE_ACTIVITY,
      confidence: 0.89,
      rawPrompt: prompt,
      entities: {
        targetDay,
        activityQuery: activityName,
      },
    };
  }

  // 7. Adding an Activity / Meal / Event
  if (/^(add|include|insert|schedule|visit|put|book|go to)\b/i.test(lower) || lower.includes('add a') || lower.includes('add to day')) {
    const targetDay = extractTargetDay(lower) || 1;
    const timeSlot = extractTimeSlot(lower);
    const itemDetails = extractActivityDetails(prompt);
    return {
      action: INTENT_ACTIONS.ADD_ACTIVITY,
      confidence: 0.91,
      rawPrompt: prompt,
      entities: {
        targetDay,
        time: timeSlot,
        title: itemDetails.title,
        type: itemDetails.type,
        cost: itemDetails.cost,
        description: itemDetails.description,
      },
    };
  }

  // 8. General Trip Planning or Major Reconfiguration
  // e.g. "Plan a 7-day trip to Tokyo and Kyoto for 2 adults with $4,000 budget"
  // or "5 days in Japan in spring"
  if (/(plan|create|generate|design|build|make|organize|schedule|vacation|itinerary)/i.test(lower) ||
      /(days in|trip to|travel to|going to)/i.test(lower) ||
      extractDays(lower) > 0 ||
      extractDestination(lower)) {
    
    const destination = extractDestination(lower);
    const durationDays = extractDays(lower) || 7;
    const travelers = extractTravelers(lower);
    const budget = extractBudgetAmount(lower);
    const budgetTier = extractBudgetTier(lower);
    const pace = extractPace(lower);
    const interests = extractInterests(lower);
    const season = extractSeason(lower);

    return {
      action: INTENT_ACTIONS.PLAN_TRIP,
      confidence: destination ? 0.94 : 0.82,
      rawPrompt: prompt,
      entities: {
        destination: destination || (currentState?.trip?.destination?.name ? currentState.trip.destination.name : 'Japan'),
        durationDays,
        travelers,
        budget: budget ? { amount: budget.amount, currency: budget.currency, tier: budgetTier || 'moderate' } : { tier: budgetTier || 'moderate' },
        pace,
        interests,
        season,
      },
    };
  }

  // Fallback: Default to asking recommendations or smart addition
  return {
    action: INTENT_ACTIONS.ASK_RECOMMENDATION,
    confidence: 0.70,
    rawPrompt: prompt,
    entities: {
      query: prompt,
    },
  };
}

// ─── Entity Extraction Helper Functions ───

export function extractDestination(text) {
  for (const dest of DESTINATION_DATABASE) {
    if (dest.aliases.some(alias => text.includes(alias))) {
      return dest.name;
    }
  }
  if (text.includes('japan')) return 'Japan (Tokyo, Kyoto, Osaka)';
  return null;
}

export function extractCity(text) {
  if (text.includes('tokyo')) return 'Tokyo';
  if (text.includes('kyoto')) return 'Kyoto';
  if (text.includes('osaka')) return 'Osaka';
  if (text.includes('nara')) return 'Nara';
  if (text.includes('hokkaido') || text.includes('sapporo')) return 'Hokkaido';
  if (text.includes('hakone') || text.includes('fuji')) return 'Hakone';
  if (text.includes('hiroshima')) return 'Hiroshima';
  return null;
}

export function extractDays(text) {
  // Matches "7 days", "10-day", "5 day", "two weeks", "a week", "3 weeks"
  const dayMatch = text.match(/(\d+)\s*(?:-|\s)?days?/i);
  if (dayMatch) return parseInt(dayMatch[1], 10);

  if (text.includes('a week') || text.includes('one week')) return 7;
  if (text.includes('two weeks') || text.includes('2 weeks')) return 14;
  if (text.includes('weekend')) return 3;

  // Spelled numbers: "five days", "seven days"
  const words = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twelve: 12, fourteen: 14 };
  for (const [w, num] of Object.entries(words)) {
    if (text.includes(`${w} day`) || text.includes(`${w}-day`)) return num;
  }

  return null;
}

export function extractTargetDay(text) {
  const match = text.match(/day\s*(\d+)/i) || text.match(/(\d+)(?:st|nd|rd|th)\s*day/i);
  if (match) return parseInt(match[1], 10);
  if (text.includes('first day')) return 1;
  if (text.includes('second day')) return 2;
  if (text.includes('third day')) return 3;
  if (text.includes('fourth day')) return 4;
  if (text.includes('fifth day')) return 5;
  if (text.includes('last day')) return 7;
  return null;
}

export function extractTimeSlot(text) {
  if (text.includes('morning') || text.includes('breakfast')) return '09:00';
  if (text.includes('noon') || text.includes('lunch') || text.includes('midday')) return '12:30';
  if (text.includes('afternoon')) return '15:00';
  if (text.includes('sunset')) return '17:30';
  if (text.includes('dinner') || text.includes('evening') || text.includes('night')) return '19:00';
  return '14:00';
}

export function extractTravelers(text) {
  const countMatch = text.match(/(\d+)\s*(?:people|travelers|guests|adults|persons)/i);
  const count = countMatch ? parseInt(countMatch[1], 10) : (text.includes('solo') ? 1 : 2);
  
  let type = 'couple';
  if (text.includes('solo') || count === 1) type = 'solo';
  else if (text.includes('family') || text.includes('kid') || text.includes('child')) type = 'family';
  else if (text.includes('friend')) type = 'friends';
  else if (count > 3) type = 'group';

  return {
    count,
    adults: count,
    children: text.includes('kid') ? 1 : 0,
    type,
  };
}

export function extractBudgetAmount(text) {
  // USD / EUR / GBP / JPY
  const jpyMatch = text.match(/(?:¥|jpy|yen)\s*([\d,]+)/i) || text.match(/([\d,]+)\s*(?:yen|jpy)/i);
  if (jpyMatch) {
    const val = parseInt(jpyMatch[1].replace(/,/g, ''), 10);
    return { amount: val, currency: 'JPY' };
  }

  const usdMatch = text.match(/\$\s*([\d,]+)/i) || text.match(/([\d,]+)\s*(?:usd|dollars?)/i);
  if (usdMatch) {
    const val = parseInt(usdMatch[1].replace(/,/g, ''), 10);
    return { amount: val * 150, currency: 'JPY', originalAmount: val, originalCurrency: 'USD' };
  }

  const eurMatch = text.match(/€\s*([\d,]+)/i) || text.match(/([\d,]+)\s*(?:eur|euros?)/i);
  if (eurMatch) {
    const val = parseInt(eurMatch[1].replace(/,/g, ''), 10);
    return { amount: val * 162, currency: 'JPY', originalAmount: val, originalCurrency: 'EUR' };
  }

  return null;
}

export function extractBudgetTier(text) {
  if (text.includes('ultra-luxury') || text.includes('ultra luxury') || text.includes('first class')) return 'ultra-luxury';
  if (text.includes('luxury') || text.includes('5-star') || text.includes('high-end') || text.includes('lavish')) return 'luxury';
  if (text.includes('budget') || text.includes('cheap') || text.includes('affordable') || text.includes('backpacker')) return 'budget';
  if (text.includes('moderate') || text.includes('mid-range') || text.includes('balanced')) return 'moderate';
  return null;
}

export function extractPace(text) {
  if (text.includes('relaxed') || text.includes('slow') || text.includes('chill') || text.includes('leisurely')) return 'relaxed';
  if (text.includes('packed') || text.includes('fast') || text.includes('action-packed') || text.includes('busy')) return 'packed';
  return 'moderate';
}

export function extractInterests(text) {
  const catalog = [
    { key: 'Temples & Shrines', patterns: ['temple', 'shrine', 'zen', 'spiritual', 'monastery'] },
    { key: 'Culinary & Street Food', patterns: ['food', 'ramen', 'sushi', 'street food', 'dining', 'culinary', 'kaiseki', 'market', 'wagyu'] },
    { key: 'Digital Art & Modern Architecture', patterns: ['art', 'teamlab', 'modern', 'architecture', 'museum', 'skyscraper'] },
    { key: 'Nature & Gardens', patterns: ['nature', 'garden', 'bamboo', 'park', 'hike', 'deer', 'scenic', 'mountain', 'fuji'] },
    { key: 'Anime & Pop Culture', patterns: ['anime', 'manga', 'gaming', 'akihabara', 'arcade', 'cosplay'] },
    { key: 'Onsen & Spas', patterns: ['onsen', 'hot spring', 'spa', 'bath', 'ryokan'] },
    { key: 'Nightlife & Bars', patterns: ['nightlife', 'bar', 'izakaya', 'pub', 'cocktail', 'neon', 'club'] },
    { key: 'High-Speed Rail', patterns: ['shinkansen', 'bullet train', 'train', 'railway'] },
    { key: 'Shopping & Craft', patterns: ['shopping', 'boutique', 'craft', 'textile', 'souvenir', 'ceramics'] },
  ];

  const matched = [];
  catalog.forEach(cat => {
    if (cat.patterns.some(p => text.includes(p))) {
      matched.push(cat.key);
    }
  });

  return matched.length > 0 ? matched : ['Culture & Temples', 'Culinary & Street Food', 'Gardens', 'Modern Architecture'];
}

export function extractSeason(text) {
  if (text.includes('spring') || text.includes('sakura') || text.includes('cherry blossom') || text.includes('april') || text.includes('march') || text.includes('may')) return 'spring';
  if (text.includes('summer') || text.includes('july') || text.includes('august') || text.includes('june')) return 'summer';
  if (text.includes('autumn') || text.includes('fall') || text.includes('momiji') || text.includes('october') || text.includes('november') || text.includes('september')) return 'autumn';
  if (text.includes('winter') || text.includes('snow') || text.includes('december') || text.includes('january') || text.includes('february')) return 'winter';
  return 'autumn';
}

function extractActivityNameForRemoval(text) {
  // e.g. "remove teamlab from day 2" -> "teamlab"
  // "delete dinner on day 3" -> "dinner"
  let clean = text.replace(/^(?:please\s+)?(?:remove|delete|drop|cancel|eliminate)\s+/i, '');
  clean = clean.replace(/\s+(?:from|on|in)\s+day\s*\d+/i, '');
  clean = clean.replace(/\s+(?:from|on|in)\s+(?:the\s+)?(?:first|second|third|fourth|fifth|last)\s+day/i, '');
  return clean.trim();
}

function extractActivityDetails(prompt) {
  let title = prompt.replace(/^(?:please\s+)?(?:add|include|insert|schedule|visit|put|book|go to)\s+/i, '');
  title = title.replace(/\s+(?:to|on|in)\s+day\s*\d+/i, '');
  title = title.replace(/\s+(?:in the morning|in the afternoon|at night|in the evening|at noon)/i, '');
  title = title.replace(/\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?/i, '');
  title = title.trim();

  let type = 'activity';
  let cost = 2000;
  if (/dinner|lunch|breakfast|ramen|sushi|food|cafe|meal|tasting|izakaya/i.test(title)) {
    type = 'meal';
    cost = 3500;
  } else if (/train|express|flight|bus|ferry|shinkansen|taxi/i.test(title)) {
    type = 'transport';
    cost = 2500;
  } else if (/hotel|ryokan|stay|resort|inn/i.test(title)) {
    type = 'lodging';
    cost = 25000;
  } else if (/temple|shrine|park|garden|walk|stroll/i.test(title)) {
    cost = 500;
  }

  // Capitalize properly
  const formattedTitle = title ? title.charAt(0).toUpperCase() + title.slice(1) : 'Curated Sightseeing Experience';

  return {
    title: formattedTitle,
    type,
    cost,
    description: `User-scheduled ${type} activity in destination schedule.`,
  };
}
