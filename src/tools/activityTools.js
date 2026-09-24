/**
 * Activity Management Tools
 * Handles adding, removing, updating, and reordering itinerary items deterministically.
 */

import { ITEM_TYPES, BOOKING_STATUS } from '../types/stateTypes.js';

export const addActivityTool = {
  name: 'addActivityTool',
  description: 'Appends or inserts an activity into a specified day of the itinerary.',

  async execute(input, currentState) {
    const {
      targetDay = 1,
      title = 'Custom Experience',
      type = ITEM_TYPES.ACTIVITY,
      cost = 2500,
      time = '14:00',
      description = 'Tailored activity added via planner.',
      location,
      tags = ['Custom'],
    } = input;

    const days = [...currentState.itinerary.days];
    const dayIndex = Math.min(Math.max(0, targetDay - 1), days.length - 1);
    const day = { ...days[dayIndex], items: [...days[dayIndex].items] };

    const newItem = {
      id: `item-${targetDay}-${Date.now()}`,
      type,
      title,
      description,
      startTime: time,
      endTime: computeEndTime(time, 90),
      durationMinutes: 90,
      cost: parseInt(cost, 10) || 0,
      location: location || {
        name: `${day.location} Landmark`,
        address: day.location,
        lat: currentState.trip.destination.coordinates.lat + (Math.random() - 0.5) * 0.05,
        lng: currentState.trip.destination.coordinates.lng + (Math.random() - 0.5) * 0.05,
      },
      bookingStatus: BOOKING_STATUS.RECOMMENDED,
      tags,
      rating: 4.8,
    };

    day.items.push(newItem);
    // Sort items by startTime
    day.items.sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));
    days[dayIndex] = day;

    // Update spent
    const newSpent = (currentState.trip.budget.spent || 0) + newItem.cost;

    return {
      itinerary: { ...currentState.itinerary, days },
      trip: {
        ...currentState.trip,
        budget: {
          ...currentState.trip.budget,
          spent: newSpent,
          breakdown: {
            ...currentState.trip.budget.breakdown,
            activities: (currentState.trip.budget.breakdown.activities || 0) + newItem.cost,
            buffer: Math.max(0, currentState.trip.budget.total - newSpent),
          },
        },
      },
      summary: `Added "${title}" to Day ${targetDay} at ${time}.`,
    };
  },
};

export const removeActivityTool = {
  name: 'removeActivityTool',
  description: 'Removes an activity from the itinerary by ID or title query.',

  async execute(input, currentState) {
    const { targetDay, activityQuery, itemId } = input;
    const days = currentState.itinerary.days.map(d => ({ ...d, items: [...d.items] }));
    let removedCost = 0;
    let removedTitle = '';

    for (let i = 0; i < days.length; i++) {
      if (targetDay && days[i].dayNumber !== targetDay) continue;

      const itemIdx = days[i].items.findIndex(item => {
        if (itemId) return item.id === itemId;
        if (activityQuery) {
          const q = activityQuery.toLowerCase();
          return item.title.toLowerCase().includes(q) || 
                 item.type.toLowerCase().includes(q) ||
                 (item.tags && item.tags.some(t => t.toLowerCase().includes(q)));
        }
        return false;
      });

      if (itemIdx !== -1) {
        const [removed] = days[i].items.splice(itemIdx, 1);
        removedCost = removed.cost || 0;
        removedTitle = removed.title;
        break;
      }
    }

    if (!removedTitle) {
      return {
        summary: `Could not find an activity matching "${activityQuery || itemId}".`,
      };
    }

    const newSpent = Math.max(0, (currentState.trip.budget.spent || 0) - removedCost);

    return {
      itinerary: { ...currentState.itinerary, days },
      trip: {
        ...currentState.trip,
        budget: {
          ...currentState.trip.budget,
          spent: newSpent,
          breakdown: {
            ...currentState.trip.budget.breakdown,
            activities: Math.max(0, (currentState.trip.budget.breakdown.activities || 0) - removedCost),
            buffer: Math.max(0, currentState.trip.budget.total - newSpent),
          },
        },
      },
      summary: `Removed "${removedTitle}" from itinerary.`,
    };
  },
};

export const updateActivityTool = {
  name: 'updateActivityTool',
  description: 'Modifies an existing activity details (time, cost, title, status).',

  async execute(input, currentState) {
    const { itemId, updates } = input;
    let costDelta = 0;

    const days = currentState.itinerary.days.map(d => ({
      ...d,
      items: d.items.map(item => {
        if (item.id === itemId) {
          if (updates.cost !== undefined) {
            costDelta = (parseInt(updates.cost, 10) || 0) - (item.cost || 0);
          }
          return { ...item, ...updates };
        }
        return item;
      }),
    }));

    const newSpent = Math.max(0, (currentState.trip.budget.spent || 0) + costDelta);

    return {
      itinerary: { ...currentState.itinerary, days },
      trip: {
        ...currentState.trip,
        budget: {
          ...currentState.trip.budget,
          spent: newSpent,
        },
      },
      summary: `Updated activity details.`,
    };
  },
};

function computeEndTime(startTime = '09:00', durationMinutes = 90) {
  const [h, m] = startTime.split(':').map(Number);
  const totalM = (h || 0) * 60 + (m || 0) + durationMinutes;
  const newH = Math.floor(totalM / 60) % 24;
  const newM = totalM % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}
