/**
 * Travel Plan Context & Application Orchestration Provider
 */

import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { planReducer, initialReducerState, ACTION_TYPES } from './planReducer.js';
import { loadStateFromStorage, saveStateToStorage, loadSettings, saveSettings } from '../services/persistenceService.js';
import { interpretWithLLM } from '../nlp/llmClient.js';
import { evaluateClarificationNeed } from '../nlp/clarificationEngine.js';
import { orchestrateIntent } from '../tools/toolOrchestrator.js';
import { INTENT_ACTIONS } from '../types/nlpTypes.js';

const TravelPlanContext = createContext(null);

export function TravelPlanProvider({ children }) {
  const [state, dispatch] = useReducer(planReducer, initialReducerState, (init) => {
    const saved = loadStateFromStorage();
    if (saved) {
      return {
        past: [],
        present: saved,
        future: [],
      };
    }
    return init;
  });

  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary' | 'map' | 'lodging' | 'transit' | 'budget'
  const [isCoPilotOpen, setIsCoPilotOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isProcessingNLP, setIsProcessingNLP] = useState(false);
  const [activeClarification, setActiveClarification] = useState(null);
  const [settings, setSettingsState] = useState(loadSettings());
  const [selectedCurrency, setSelectedCurrency] = useState('JPY');
  const [notification, setNotification] = useState(null);

  // Auto-persist to localStorage when state changes
  useEffect(() => {
    saveStateToStorage(state.present);
  }, [state.present]);

  // Toast notification helper
  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }, []);

  // Update Settings
  const updateSettings = useCallback((newSettings) => {
    setSettingsState(newSettings);
    saveSettings(newSettings);
    if (newSettings.preferredCurrency) {
      setSelectedCurrency(newSettings.preferredCurrency);
    }
    showNotification('Settings updated successfully', 'success');
  }, [showNotification]);

  // Primary NLP Execution pipeline
  const executeNLP = useCallback(async (promptText) => {
    if (!promptText || !promptText.trim()) return;

    setIsProcessingNLP(true);
    setActiveClarification(null);

    try {
      // 1. NLP / LLM Interpretation
      const parsedIntent = await interpretWithLLM(promptText, state.present, settings);

      // Handle direct undo / redo / reset intents
      if (parsedIntent.action === INTENT_ACTIONS.UNDO) {
        if (state.past.length > 0) {
          dispatch({ type: ACTION_TYPES.UNDO });
          showNotification('Reverted last action', 'info');
        } else {
          showNotification('No previous actions to undo', 'warn');
        }
        setIsProcessingNLP(false);
        return;
      }

      if (parsedIntent.action === INTENT_ACTIONS.REDO) {
        if (state.future.length > 0) {
          dispatch({ type: ACTION_TYPES.REDO });
          showNotification('Restored redone action', 'info');
        } else {
          showNotification('No actions to redo', 'warn');
        }
        setIsProcessingNLP(false);
        return;
      }

      if (parsedIntent.action === INTENT_ACTIONS.RESET) {
        dispatch({ type: ACTION_TYPES.RESET_TRIP });
        showNotification('Trip reset to default clean state', 'info');
        setIsProcessingNLP(false);
        return;
      }

      // 2. Clarification Engine Evaluation
      const clarificationCheck = evaluateClarificationNeed(parsedIntent, state.present);

      if (clarificationCheck.needsClarification && clarificationCheck.isBlocking) {
        const topQuestion = clarificationCheck.questions[0];
        setActiveClarification({
          question: topQuestion,
          originalIntent: parsedIntent,
        });
        setIsProcessingNLP(false);
        return;
      }

      // 3. Merge safe inferred defaults
      const resolvedEntities = {
        ...clarificationCheck.inferredDefaults,
        ...parsedIntent.entities,
      };
      const finalIntent = {
        ...parsedIntent,
        entities: resolvedEntities,
      };

      // 4. Deterministic Tool Orchestration
      const orchestrationResult = await orchestrateIntent(finalIntent, state.present);

      if (orchestrationResult.success) {
        dispatch({
          type: ACTION_TYPES.APPLY_TOOL_RESULT,
          payload: orchestrationResult.nextState,
        });
        showNotification(orchestrationResult.summary || 'Trip plan updated', 'success');

        // Automatically switch tabs if relevant
        if (parsedIntent.action === INTENT_ACTIONS.SEARCH_LODGING) {
          setActiveTab('lodging');
        } else if (parsedIntent.action === INTENT_ACTIONS.SEARCH_TRANSIT) {
          setActiveTab('transit');
        } else if (parsedIntent.action === INTENT_ACTIONS.CALCULATE_BUDGET) {
          setActiveTab('budget');
        } else if (parsedIntent.action === INTENT_ACTIONS.OPTIMIZE_ROUTE) {
          setActiveTab('itinerary');
        }
      } else {
        showNotification(orchestrationResult.summary || 'Failed to update trip plan', 'error');
      }
    } catch (err) {
      console.error('NLP execution failed:', err);
      showNotification('An error occurred while processing your request.', 'error');
    } finally {
      setIsProcessingNLP(false);
    }
  }, [state.present, state.past, state.future, settings, showNotification]);

  // Clarification selection answer
  const answerClarification = useCallback(async (optionValue) => {
    if (!activeClarification) return;
    const { originalIntent, question } = activeClarification;
    setActiveClarification(null);

    // Patch original intent with user choice
    const updatedEntities = {
      ...originalIntent.entities,
      [question.field]: optionValue,
    };

    const updatedIntent = {
      ...originalIntent,
      entities: updatedEntities,
    };

    setIsProcessingNLP(true);
    try {
      const result = await orchestrateIntent(updatedIntent, state.present);
      if (result.success) {
        dispatch({
          type: ACTION_TYPES.APPLY_TOOL_RESULT,
          payload: result.nextState,
        });
        showNotification(result.summary || 'Updated with your selection', 'success');
      }
    } catch (err) {
      console.error('Clarification resolution failed:', err);
    } finally {
      setIsProcessingNLP(false);
    }
  }, [activeClarification, state.present, showNotification]);

  // Undo / Redo shortcuts
  const undo = useCallback(() => {
    if (state.past.length > 0) {
      dispatch({ type: ACTION_TYPES.UNDO });
      showNotification('Undone', 'info');
    }
  }, [state.past.length, showNotification]);

  const redo = useCallback(() => {
    if (state.future.length > 0) {
      dispatch({ type: ACTION_TYPES.REDO });
      showNotification('Redone', 'info');
    }
  }, [state.future.length, showNotification]);

  const resetTrip = useCallback(() => {
    dispatch({ type: ACTION_TYPES.RESET_TRIP });
    showNotification('Reset to initial plan', 'info');
  }, [showNotification]);

  // Inline activity updater
  const updateItemInline = useCallback((dayNumber, itemId, updates) => {
    dispatch({
      type: ACTION_TYPES.UPDATE_ITEM_INLINE,
      payload: { dayNumber, itemId, updates },
    });
    showNotification('Activity details saved', 'success');
  }, [showNotification]);

  const value = {
    state: state.present,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    undo,
    redo,
    resetTrip,
    activeTab,
    setActiveTab,
    isCoPilotOpen,
    setIsCoPilotOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isAddActivityOpen,
    setIsAddActivityOpen,
    isExportOpen,
    setIsExportOpen,
    editingItem,
    setEditingItem,
    isProcessingNLP,
    activeClarification,
    setActiveClarification,
    executeNLP,
    answerClarification,
    updateItemInline,
    selectedCurrency,
    setSelectedCurrency,
    settings,
    updateSettings,
    notification,
  };

  return (
    <TravelPlanContext.Provider value={value}>
      {children}
    </TravelPlanContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTravelPlan() {
  const ctx = useContext(TravelPlanContext);
  if (!ctx) {
    throw new Error('useTravelPlan must be used within a TravelPlanProvider');
  }
  return ctx;
}
