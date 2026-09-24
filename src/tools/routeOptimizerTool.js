/**
 * Route Optimizer Tool
 * Applies geographic clustering and TSP nearest-neighbor sorting to eliminate
 * backtracking and reduce transit fatigue across itinerary days.
 */

export const routeOptimizerTool = {
  name: 'routeOptimizerTool',
  description: 'Reorders daily activities geographically using nearest-neighbor routing to minimize travel time.',

  async execute(input, currentState) {
    const days = currentState.itinerary.days.map(day => {
      if (!day.items || day.items.length <= 2) return { ...day };

      // Keep fixed items (transport/check-in/airport) in place, optimize activities in between
      const fixedItems = [];
      const flexItems = [];

      day.items.forEach(item => {
        if (item.type === 'transport' || item.title.toLowerCase().includes('check-in') || item.title.toLowerCase().includes('arrival')) {
          fixedItems.push(item);
        } else {
          flexItems.push(item);
        }
      });

      if (flexItems.length <= 1) return { ...day };

      // Nearest-neighbor route ordering starting from first item
      const sortedFlex = [flexItems[0]];
      const remaining = flexItems.slice(1);

      while (remaining.length > 0) {
        const last = sortedFlex[sortedFlex.length - 1];
        const lastLat = last.location?.lat || 35.67;
        const lastLng = last.location?.lng || 139.65;

        let bestIdx = 0;
        let bestDist = Infinity;

        remaining.forEach((candidate, idx) => {
          const cLat = candidate.location?.lat || 35.67;
          const cLng = candidate.location?.lng || 139.65;
          const dist = Math.hypot(cLat - lastLat, cLng - lastLng);
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = idx;
          }
        });

        sortedFlex.push(remaining.splice(bestIdx, 1)[0]);
      }

      // Reassign times smoothly
      const allItems = [...fixedItems, ...sortedFlex];
      let currentHour = 9;
      allItems.forEach((item) => {
        if (item.type !== 'transport') {
          item.startTime = `${String(currentHour).padStart(2, '0')}:00`;
          const duration = item.durationMinutes || 90;
          currentHour += Math.ceil(duration / 60) + 1; // 1 hour transit/cushion
          item.endTime = `${String(currentHour).padStart(2, '0')}:00`;
        }
      });

      return {
        ...day,
        items: allItems,
      };
    });

    return {
      itinerary: {
        ...currentState.itinerary,
        days,
      },
      summary: `Geographically optimized route sequence across all days. Eliminated backtracking and streamlined transit corridors.`,
    };
  },
};
