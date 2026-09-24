/**
 * Comprehensive Automated Test Suite
 * Tests NLP Parsing, Clarification Engine, Tool Orchestration, State Reducer, and Currency Conversions.
 */

import { parseNaturalLanguage } from '../nlp/semanticParser.js';
import { evaluateClarificationNeed } from '../nlp/clarificationEngine.js';
import { orchestrateIntent } from '../tools/toolOrchestrator.js';
import { createInitialTripState } from '../types/stateTypes.js';
import { INTENT_ACTIONS } from '../types/nlpTypes.js';
import { planReducer, ACTION_TYPES } from '../context/planReducer.js';
import { convertCurrency, formatCurrency } from '../services/currencyService.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n--- 1. Testing NLP Semantic Parser ---');

  // Test 1.1: Complex multi-entity trip creation prompt
  const p1 = parseNaturalLanguage('Plan a 7-day culinary trip to Tokyo and Kyoto for 2 adults with $4,000 budget');
  assert(p1.action === INTENT_ACTIONS.PLAN_TRIP, 'Action identified as PLAN_TRIP');
  assert(p1.entities.durationDays === 7, 'Duration parsed as 7 days');
  assert(p1.entities.travelers.count === 2, 'Travelers parsed as 2');
  assert(p1.entities.budget.amount > 0, 'Budget extracted');
  assert(p1.confidence >= 0.9, 'Confidence >= 0.90');

  // Test 1.2: Incremental activity addition
  const p2 = parseNaturalLanguage('Add sunset drink at Shibuya Sky to Day 1');
  assert(p2.action === INTENT_ACTIONS.ADD_ACTIVITY, 'Action identified as ADD_ACTIVITY');
  assert(p2.entities.targetDay === 1, 'Target day identified as 1');
  assert(p2.entities.title.toLowerCase().includes('shibuya sky'), 'Title parsed containing Shibuya Sky');

  // Test 1.3: Item removal
  const p3 = parseNaturalLanguage('Remove teamLab from Day 2');
  assert(p3.action === INTENT_ACTIONS.REMOVE_ACTIVITY, 'Action identified as REMOVE_ACTIVITY');
  assert(p3.entities.targetDay === 2, 'Target day identified as 2');
  assert(p3.entities.activityQuery.toLowerCase().includes('teamlab'), 'Query parsed containing teamLab');

  // Test 1.4: Route optimization
  const p4 = parseNaturalLanguage('Optimize our route to eliminate backtracking');
  assert(p4.action === INTENT_ACTIONS.OPTIMIZE_ROUTE, 'Action identified as OPTIMIZE_ROUTE');

  // Test 1.5: Lodging search
  const p5 = parseNaturalLanguage('Find luxury ryokans in Kyoto');
  assert(p5.action === INTENT_ACTIONS.SEARCH_LODGING, 'Action identified as SEARCH_LODGING');
  assert(p5.entities.city === 'Kyoto', 'City identified as Kyoto');
  assert(p5.entities.tier === 'luxury', 'Tier identified as luxury');

  // Test 1.6: State operations
  const pUndo = parseNaturalLanguage('undo that');
  assert(pUndo.action === INTENT_ACTIONS.UNDO, 'Undo identified');

  const pRedo = parseNaturalLanguage('redo');
  assert(pRedo.action === INTENT_ACTIONS.REDO, 'Redo identified');

  console.log('\n--- 2. Testing Clarification Engine ---');

  // Test 2.1: Blocking clarification when destination is completely missing
  const blankState = { trip: null };
  const blankIntent = { action: INTENT_ACTIONS.PLAN_TRIP, entities: {}, rawPrompt: 'Plan a vacation' };
  const c1 = evaluateClarificationNeed(blankIntent, blankState);
  assert(c1.needsClarification === true, 'Needs clarification when destination absent');
  assert(c1.isBlocking === true, 'Clarification is blocking');
  assert(c1.questions.length > 0, 'Generates destination clarification question');

  // Test 2.2: Safe inference when destination is provided
  const knownState = createInitialTripState();
  const knownIntent = { action: INTENT_ACTIONS.PLAN_TRIP, entities: { destination: 'Japan' }, rawPrompt: 'Plan a trip to Japan' };
  const c2 = evaluateClarificationNeed(knownIntent, knownState);
  assert(c2.isBlocking === false, 'Non-blocking when destination is provided');
  assert(c2.inferredDefaults.durationDays === 7, 'Safely infers 7 days duration');
  assert(c2.inferredDefaults.travelers.count === 2, 'Safely infers 2 travelers');

  console.log('\n--- 3. Testing Deterministic Tool Orchestrator ---');

  const initialState = createInitialTripState();

  // Test 3.1: Execute addActivityTool through orchestrator
  const addIntent = {
    action: INTENT_ACTIONS.ADD_ACTIVITY,
    entities: {
      targetDay: 1,
      title: 'Kabukicho Neon Photography Tour',
      time: '20:00',
      cost: 3000,
      description: 'Night stroll with professional camera guide.',
    },
    rawPrompt: 'Add Kabukicho tour to Day 1',
    confidence: 0.95,
  };

  const orchAddResult = await orchestrateIntent(addIntent, initialState);
  assert(orchAddResult.success === true, 'Orchestration succeeded for addActivity');
  const day1Items = orchAddResult.nextState.itinerary.days[0].items;
  const addedItem = day1Items.find(i => i.title.includes('Kabukicho'));
  assert(Boolean(addedItem), 'New item exists in Day 1 items');
  assert(orchAddResult.nextState.trip.budget.spent > initialState.trip.budget.spent, 'Budget spent increased by item cost');
  assert(orchAddResult.toolTrace.length > 0, 'Tool trace populated');

  // Test 3.2: Execute routeOptimizerTool through orchestrator
  const optIntent = {
    action: INTENT_ACTIONS.OPTIMIZE_ROUTE,
    entities: {},
    rawPrompt: 'Optimize route',
    confidence: 0.95,
  };

  const orchOptResult = await orchestrateIntent(optIntent, orchAddResult.nextState);
  assert(orchOptResult.success === true, 'Route optimization succeeded');
  assert(orchOptResult.toolTrace[0].tool === 'routeOptimizerTool', 'routeOptimizerTool executed in trace');

  // Test 3.3: Execute removeActivityTool through orchestrator
  const remIntent = {
    action: INTENT_ACTIONS.REMOVE_ACTIVITY,
    entities: {
      targetDay: 1,
      activityQuery: 'Kabukicho',
    },
    rawPrompt: 'Remove Kabukicho from Day 1',
    confidence: 0.95,
  };

  const orchRemResult = await orchestrateIntent(remIntent, orchOptResult.nextState);
  assert(orchRemResult.success === true, 'Remove activity succeeded');
  const day1AfterRem = orchRemResult.nextState.itinerary.days[0].items;
  assert(!day1AfterRem.some(i => i.title.includes('Kabukicho')), 'Item was removed from itinerary');

  console.log('\n--- 4. Testing State Reducer with Undo / Redo ---');

  const reducerState0 = {
    past: [],
    present: initialState,
    future: [],
  };

  // Dispatch state change
  const reducerState1 = planReducer(reducerState0, {
    type: ACTION_TYPES.APPLY_TOOL_RESULT,
    payload: orchAddResult.nextState,
  });

  assert(reducerState1.past.length === 1, 'Past stack contains 1 snapshot');
  assert(reducerState1.present.trip.budget.spent !== initialState.trip.budget.spent, 'State updated');

  // Dispatch Undo
  const reducerState2 = planReducer(reducerState1, { type: ACTION_TYPES.UNDO });
  assert(reducerState2.past.length === 0, 'Past stack popped to 0');
  assert(reducerState2.future.length === 1, 'Future stack pushed to 1');
  assert(reducerState2.present.trip.budget.spent === initialState.trip.budget.spent, 'Restored original state on Undo');

  // Dispatch Redo
  const reducerState3 = planReducer(reducerState2, { type: ACTION_TYPES.REDO });
  assert(reducerState3.past.length === 1, 'Past stack restored on Redo');
  assert(reducerState3.future.length === 0, 'Future stack cleared on Redo');
  assert(reducerState3.present.trip.budget.spent === orchAddResult.nextState.trip.budget.spent, 'State restored on Redo');

  console.log('\n--- 5. Testing Currency Conversion ---');
  const usdConverted = convertCurrency(15000, 'JPY', 'USD');
  assert(usdConverted > 0, 'JPY to USD converted properly');
  const formatted = formatCurrency(15000, 'JPY');
  assert(formatted.includes('¥'), 'Formatted JPY contains yen symbol');
  const formattedUSD = formatCurrency(100, 'USD');
  assert(formattedUSD.includes('$'), 'Formatted USD contains dollar symbol');

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
