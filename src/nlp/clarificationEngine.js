/**
 * Clarification Engine
 * Evaluates whether an incoming request can execute immediately, uses safe inferences,
 * or requires a minimal, non-blocking clarification prompt with quick-select options.
 */

import { INTENT_ACTIONS, CLARIFICATION_PRIORITY } from '../types/nlpTypes.js';

export function evaluateClarificationNeed(parsedIntent, currentState) {
  const { action, entities } = parsedIntent;
  const questions = [];
  const inferredDefaults = {};

  if (action === INTENT_ACTIONS.PLAN_TRIP) {
    // 1. Destination check
    const hasCurrentDest = currentState?.trip?.destination?.name;
    const hasPromptDest = entities.destination;

    if (!hasPromptDest && !hasCurrentDest) {
      questions.push({
        id: 'clarify-dest',
        field: 'destination',
        priority: CLARIFICATION_PRIORITY.BLOCKING,
        prompt: 'Which extraordinary destination shall we plan for?',
        options: [
          { label: 'Japan (Tokyo, Kyoto, Osaka)', value: 'Japan (Tokyo, Kyoto, Osaka)' },
          { label: 'Hokkaido Snow & Spas', value: 'Hokkaido (Sapporo, Otaru, Niseko)' },
          { label: 'Hakone & Mount Fuji', value: 'Hakone & Mount Fuji' },
          { label: 'Paris, France', value: 'Paris, France' },
          { label: 'Rome, Italy', value: 'Rome, Italy' },
          { label: 'Bali Sanctuary, Indonesia', value: 'Bali, Indonesia' },
        ],
      });
    }

    // 2. Duration check - Safe inference to 7 days if unspecified
    if (!entities.durationDays) {
      inferredDefaults.durationDays = currentState?.trip?.dates?.durationDays || 7;
    }

    // 3. Traveler style check - Safe inference to Couple (2)
    if (!entities.travelers) {
      inferredDefaults.travelers = { count: 2, adults: 2, children: 0, type: 'couple' };
    }

    // 4. Budget check - Safe inference to Moderate tier
    if (!entities.budget || (!entities.budget.amount && !entities.budget.tier)) {
      inferredDefaults.budget = { tier: 'moderate', currency: 'JPY', amount: 450000 };
    }
  }

  // Activity insertion ambiguity
  if (action === INTENT_ACTIONS.ADD_ACTIVITY) {
    if (!entities.targetDay) {
      // Safe default: Day 1 or active day
      inferredDefaults.targetDay = 1;
    }
  }

  const isBlocking = questions.some(q => q.priority === CLARIFICATION_PRIORITY.BLOCKING);

  return {
    needsClarification: questions.length > 0,
    isBlocking,
    questions,
    inferredDefaults,
  };
}
