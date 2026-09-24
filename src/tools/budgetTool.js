/**
 * Budget Intelligence Tool
 * Computes live category allocations, spending health, and optimization recommendations.
 */

export const budgetTool = {
  name: 'budgetTool',
  description: 'Audits expenses, recalculates categories, and checks budget feasibility.',

  async execute(input, currentState) {
    const { totalBudget } = input || {};
    const trip = currentState.trip;
    const itinerary = currentState.itinerary;
    const lodging = currentState.lodging || [];
    const transit = currentState.transit || [];

    // Sum activities & meals
    let activityTotal = 0;
    let diningTotal = 0;

    itinerary.days.forEach(day => {
      day.items.forEach(item => {
        if (item.type === 'meal') {
          diningTotal += item.cost || 0;
        } else if (item.type === 'activity') {
          activityTotal += item.cost || 0;
        }
      });
    });

    // Sum lodging
    const lodgingTotal = lodging
      .filter(l => l.isSelected)
      .reduce((sum, l) => sum + (l.pricePerNight * (l.nights || 2)), 0);

    // Sum transit
    const transitTotal = transit
      .filter(t => t.status === 'confirmed')
      .reduce((sum, t) => sum + (t.cost || 0), 0);

    const spent = activityTotal + diningTotal + lodgingTotal + transitTotal;
    const total = totalBudget || trip.budget.total || 450000;
    const buffer = Math.max(0, total - spent);

    let advice = 'Budget is healthy and well-balanced.';
    if (spent > total) {
      advice = `Warning: Projected expenses exceed total budget by ¥${(spent - total).toLocaleString()}. Consider switching to moderate lodging or adjusting high-tier activities.`;
    } else if (buffer < total * 0.1) {
      advice = `Tight buffer: You have ¥${buffer.toLocaleString()} (under 10%) reserved for spontaneous dining and local transit.`;
    } else {
      advice = `Optimal balance: ¥${buffer.toLocaleString()} (${Math.round((buffer / total) * 100)}%) safely reserved for dining, shopping, and unexpected pleasures.`;
    }

    return {
      trip: {
        ...trip,
        budget: {
          ...trip.budget,
          total,
          spent,
          breakdown: {
            transport: transitTotal,
            lodging: lodgingTotal,
            activities: activityTotal,
            dining: diningTotal,
            buffer,
          },
        },
      },
      summary: `Audited budget: ¥${spent.toLocaleString()} allocated of ¥${total.toLocaleString()}. ${advice}`,
    };
  },
};
