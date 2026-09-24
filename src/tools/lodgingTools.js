/**
 * Lodging Tools
 * Searches accommodations and toggles selected properties.
 */

import { searchLodging } from '../services/lodgingService.js';

export const searchLodgingTool = {
  name: 'searchLodgingTool',
  description: 'Finds curated accommodations matching destination city and budget tier.',

  async execute(input) {
    const { city, tier = 'moderate' } = input;
    const matches = searchLodging({ city, budgetTier: tier });

    // Mark matches in lodging options
    const updatedLodging = matches.map((m, idx) => ({
      ...m,
      isSelected: idx === 0, // default first one selected
    }));

    return {
      lodging: updatedLodging,
      summary: `Found ${matches.length} curated accommodations for ${tier} tier.`,
    };
  },
};

export const selectLodgingTool = {
  name: 'selectLodgingTool',
  description: 'Selects or unselects an accommodation option and recalculates lodging expense.',

  async execute(input, currentState) {
    const { lodgingId } = input;
    const lodging = currentState.lodging.map(l => ({
      ...l,
      isSelected: l.id === lodgingId ? !l.isSelected : l.isSelected,
    }));

    // Recalculate lodging cost
    const totalLodgingCost = lodging
      .filter(l => l.isSelected)
      .reduce((sum, l) => sum + (l.pricePerNight * (l.nights || 2)), 0);

    return {
      lodging,
      trip: {
        ...currentState.trip,
        budget: {
          ...currentState.trip.budget,
          breakdown: {
            ...currentState.trip.budget.breakdown,
            lodging: totalLodgingCost,
          },
        },
      },
      summary: `Updated accommodation selection.`,
    };
  },
};
