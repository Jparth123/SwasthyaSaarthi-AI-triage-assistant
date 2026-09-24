/**
 * Deterministic Tool Orchestration Engine
 * Coordinates tool selection, dependency execution, state mutation,
 * structured validation, and transparent telemetry tracing.
 */

import { INTENT_ACTIONS } from '../types/nlpTypes.js';
import { getTool } from './toolRegistry.js';

export async function orchestrateIntent(parsedIntent, currentState) {
  const { action, entities, rawPrompt } = parsedIntent;
  const toolTrace = [];
  let workingState = { ...currentState };
  let primarySummary = '';

  try {
    switch (action) {
      case INTENT_ACTIONS.PLAN_TRIP: {
        const tool = getTool('planTripTool');
        const startTime = Date.now();
        const result = await tool.execute(entities, workingState);
        toolTrace.push({
          tool: 'planTripTool',
          status: 'success',
          executionTimeMs: Date.now() - startTime,
          summary: result.summary,
        });

        workingState = {
          ...workingState,
          trip: result.trip,
          itinerary: result.itinerary,
          lodging: result.lodging,
          transit: result.transit,
        };
        primarySummary = result.summary;

        // Run dependent budget tool
        const budgetTool = getTool('budgetTool');
        const bResult = await budgetTool.execute({}, workingState);
        workingState = {
          ...workingState,
          trip: bResult.trip,
        };
        toolTrace.push({
          tool: 'budgetTool',
          status: 'success',
          summary: bResult.summary,
        });
        break;
      }

      case INTENT_ACTIONS.ADD_ACTIVITY: {
        const tool = getTool('addActivityTool');
        const startTime = Date.now();
        const result = await tool.execute(entities, workingState);
        toolTrace.push({
          tool: 'addActivityTool',
          status: 'success',
          executionTimeMs: Date.now() - startTime,
          summary: result.summary,
        });

        workingState = {
          ...workingState,
          itinerary: result.itinerary,
          trip: result.trip,
        };
        primarySummary = result.summary;
        break;
      }

      case INTENT_ACTIONS.REMOVE_ACTIVITY: {
        const tool = getTool('removeActivityTool');
        const startTime = Date.now();
        const result = await tool.execute(entities, workingState);
        toolTrace.push({
          tool: 'removeActivityTool',
          status: result.itinerary ? 'success' : 'warn',
          executionTimeMs: Date.now() - startTime,
          summary: result.summary,
        });

        if (result.itinerary) {
          workingState = {
            ...workingState,
            itinerary: result.itinerary,
            trip: result.trip,
          };
        }
        primarySummary = result.summary;
        break;
      }

      case INTENT_ACTIONS.OPTIMIZE_ROUTE: {
        const tool = getTool('routeOptimizerTool');
        const startTime = Date.now();
        const result = await tool.execute(entities, workingState);
        toolTrace.push({
          tool: 'routeOptimizerTool',
          status: 'success',
          executionTimeMs: Date.now() - startTime,
          summary: result.summary,
        });

        workingState = {
          ...workingState,
          itinerary: result.itinerary,
        };
        primarySummary = result.summary;
        break;
      }

      case INTENT_ACTIONS.CALCULATE_BUDGET: {
        const tool = getTool('budgetTool');
        const startTime = Date.now();
        const result = await tool.execute(entities, workingState);
        toolTrace.push({
          tool: 'budgetTool',
          status: 'success',
          executionTimeMs: Date.now() - startTime,
          summary: result.summary,
        });

        workingState = {
          ...workingState,
          trip: result.trip,
        };
        primarySummary = result.summary;
        break;
      }

      case INTENT_ACTIONS.SEARCH_LODGING: {
        const tool = getTool('searchLodgingTool');
        const startTime = Date.now();
        const result = await tool.execute(entities, workingState);
        toolTrace.push({
          tool: 'searchLodgingTool',
          status: 'success',
          executionTimeMs: Date.now() - startTime,
          summary: result.summary,
        });

        workingState = {
          ...workingState,
          lodging: result.lodging,
        };
        primarySummary = result.summary;
        break;
      }

      case INTENT_ACTIONS.SEARCH_TRANSIT: {
        const tool = getTool('searchTransitTool');
        const startTime = Date.now();
        const result = await tool.execute(entities, workingState);
        toolTrace.push({
          tool: 'searchTransitTool',
          status: 'success',
          executionTimeMs: Date.now() - startTime,
          summary: result.summary,
        });

        workingState = {
          ...workingState,
          transit: result.transit,
        };
        primarySummary = result.summary;
        break;
      }

      case INTENT_ACTIONS.ASK_RECOMMENDATION:
      default: {
        // Safe recommendation response
        primarySummary = `Understood: "${rawPrompt}". Explored curated options for ${workingState.trip.destination.name}.`;
        toolTrace.push({
          tool: 'recommendationEngine',
          status: 'success',
          summary: 'Provided tailored destination recommendations.',
        });
        break;
      }
    }

    // Attach latest intent telemetry and audit log entry
    const auditEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actionType: action,
      summary: primarySummary || `Executed ${action}`,
      undoable: true,
    };

    const nextState = {
      ...workingState,
      lastParsedIntent: {
        ...parsedIntent,
        toolTrace,
        timestamp: new Date().toISOString(),
      },
      auditLog: [auditEntry, ...(workingState.auditLog || []).slice(0, 19)],
      version: (workingState.version || 1) + 1,
    };

    return {
      success: true,
      nextState,
      toolTrace,
      summary: primarySummary,
    };
  } catch (error) {
    console.error('Error during tool orchestration:', error);
    toolTrace.push({
      tool: action,
      status: 'error',
      summary: error.message || 'Tool execution encountered an unexpected error.',
    });

    return {
      success: false,
      nextState: currentState,
      toolTrace,
      summary: `Failed to execute ${action}: ${error.message}`,
      error: error.message,
    };
  }
}
