/**
 * Deterministic Plan Reducer with Undo / Redo Timeline
 */

import { createInitialTripState } from '../types/stateTypes.js';

export const ACTION_TYPES = {
  SET_STATE: 'SET_STATE',
  APPLY_TOOL_RESULT: 'APPLY_TOOL_RESULT',
  UNDO: 'UNDO',
  REDO: 'REDO',
  RESET_TRIP: 'RESET_TRIP',
  SET_CLARIFICATIONS: 'SET_CLARIFICATIONS',
  CLEAR_CLARIFICATIONS: 'CLEAR_CLARIFICATIONS',
  UPDATE_ITEM_INLINE: 'UPDATE_ITEM_INLINE',
};

export const initialReducerState = {
  present: createInitialTripState(),
  past: [],
  future: [],
};

export function planReducer(state, action) {
  const { past, present, future } = state;

  switch (action.type) {
    case ACTION_TYPES.APPLY_TOOL_RESULT: {
      const nextPresent = action.payload;
      return {
        past: [present, ...past.slice(0, 19)], // keep last 20 snapshots
        present: nextPresent,
        future: [], // clear redo branch on new action
      };
    }

    case ACTION_TYPES.SET_STATE: {
      return {
        ...state,
        present: action.payload,
      };
    }

    case ACTION_TYPES.UNDO: {
      if (past.length === 0) return state;
      const previous = past[0];
      const newPast = past.slice(1);
      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };
    }

    case ACTION_TYPES.REDO: {
      if (future.length === 0) return state;
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        past: [present, ...past],
        present: next,
        future: newFuture,
      };
    }

    case ACTION_TYPES.RESET_TRIP: {
      const fresh = createInitialTripState();
      return {
        past: [present, ...past],
        present: fresh,
        future: [],
      };
    }

    case ACTION_TYPES.SET_CLARIFICATIONS: {
      return {
        ...state,
        present: {
          ...present,
          clarifications: action.payload,
        },
      };
    }

    case ACTION_TYPES.CLEAR_CLARIFICATIONS: {
      return {
        ...state,
        present: {
          ...present,
          clarifications: [],
        },
      };
    }

    case ACTION_TYPES.UPDATE_ITEM_INLINE: {
      const { dayNumber, itemId, updates } = action.payload;
      const updatedDays = present.itinerary.days.map(d => {
        if (d.dayNumber !== dayNumber) return d;
        return {
          ...d,
          items: d.items.map(item => item.id === itemId ? { ...item, ...updates } : item),
        };
      });

      const nextPresent = {
        ...present,
        itinerary: {
          ...present.itinerary,
          days: updatedDays,
        },
      };

      return {
        past: [present, ...past.slice(0, 19)],
        present: nextPresent,
        future: [],
      };
    }

    default:
      return state;
  }
}
