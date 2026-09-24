/**
 * Transit Tools
 * Discovers and books transit legs between destinations.
 */

import { searchTransit } from '../services/transitService.js';

export const searchTransitTool = {
  name: 'searchTransitTool',
  description: 'Searches bullet train, express rail, and flight routes.',

  async execute(input) {
    const { from, to } = input;
    const transit = searchTransit({ from, to });

    return {
      transit,
      summary: `Found ${transit.length} intercity transit options.`,
    };
  },
};
