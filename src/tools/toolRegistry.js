/**
 * Central Tool Registry
 * Provides type discovery, documentation, and lookup for all application tools.
 */

import { planTripTool } from './planTripTool.js';
import { addActivityTool, removeActivityTool, updateActivityTool } from './activityTools.js';
import { searchLodgingTool, selectLodgingTool } from './lodgingTools.js';
import { searchTransitTool } from './transitTools.js';
import { routeOptimizerTool } from './routeOptimizerTool.js';
import { budgetTool } from './budgetTool.js';

export const TOOL_REGISTRY = {
  planTripTool,
  addActivityTool,
  removeActivityTool,
  updateActivityTool,
  searchLodgingTool,
  selectLodgingTool,
  searchTransitTool,
  routeOptimizerTool,
  budgetTool,
};

export function getTool(name) {
  return TOOL_REGISTRY[name] || null;
}

export function getAllTools() {
  return Object.values(TOOL_REGISTRY);
}
