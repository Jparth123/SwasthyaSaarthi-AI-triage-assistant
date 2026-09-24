/**
 * Transit Knowledge Service
 * Provides comprehensive transit legs, schedules, seat classes, and fare data.
 */

export const TRANSIT_CATALOG = [
  {
    id: 'transit-tok-kyo-shinkansen',
    mode: 'High-Speed Rail',
    name: 'Tokaido Shinkansen Nozomi (Tokyo -> Kyoto)',
    from: 'Tokyo Station (JR Central)',
    to: 'Kyoto Station',
    departureInterval: 'Every 10-15 minutes',
    typicalDeparture: '09:00',
    duration: '2h 15m',
    cost: 14200,
    currency: 'JPY',
    seatClass: 'Green Car (Reserved)',
    notes: 'Book seats on right side (seat E) for unobstructed Mount Fuji views on clear mornings.',
    tags: ['Bullet Train', 'Scenic', 'Recommended'],
  },
  {
    id: 'transit-kyo-osa-shinkansen',
    mode: 'High-Speed Rail',
    name: 'Tokaido Shinkansen (Kyoto -> Shin-Osaka)',
    from: 'Kyoto Station',
    to: 'Shin-Osaka Station',
    departureInterval: 'Every 8 minutes',
    typicalDeparture: '10:00',
    duration: '14m',
    cost: 1450,
    currency: 'JPY',
    seatClass: 'Ordinary Reserved',
    notes: 'Ultra-fast intercity transit link between Kyoto and Osaka hubs.',
    tags: ['Bullet Train', 'Express'],
  },
  {
    id: 'transit-kyo-nara-kintetsu',
    mode: 'Express Sightseeing Train',
    name: 'Kintetsu Sightseeing Express Aoniyoshi (Kyoto -> Nara)',
    from: 'Kyoto Station',
    to: 'Kintetsu-Nara Station',
    departureInterval: 'Twice daily',
    typicalDeparture: '09:20',
    duration: '35m',
    cost: 1960,
    currency: 'JPY',
    seatClass: 'Salon Seat with Bar Service',
    notes: 'Luxurious purple imperial-themed sightseeing train serving Nara Yamato sweets and craft beer.',
    tags: ['Luxury Rail', 'Sightseeing'],
  },
  {
    id: 'transit-nara-osa-rapid',
    mode: 'Commuter Express',
    name: 'Kintetsu Nara Line Rapid Express (Nara -> Namba)',
    from: 'Kintetsu-Nara Station',
    to: 'Osaka Namba Station',
    departureInterval: 'Every 15 minutes',
    typicalDeparture: '14:30',
    duration: '38m',
    cost: 680,
    currency: 'JPY',
    seatClass: 'Standard Transit',
    notes: 'Direct transit from sacred deer park directly into downtown Osaka Dotonbori district.',
    tags: ['Local Rail', 'Convenient'],
  },
  {
    id: 'transit-tok-nex',
    mode: 'Airport Express',
    name: 'Narita Express (N’EX)',
    from: 'Narita International Airport (NRT)',
    to: 'Shibuya / Shinjuku / Tokyo Station',
    departureInterval: 'Every 30 minutes',
    typicalDeparture: '14:15',
    duration: '1h 15m',
    cost: 3200,
    currency: 'JPY',
    seatClass: 'Reserved Reclining',
    notes: 'Dedicated luggage racks with dial locks and individual AC outlets.',
    tags: ['Airport Transfer'],
  },
  {
    id: 'transit-osa-rapit',
    mode: 'Airport Express',
    name: 'Nankai Rapi:t Airport Express (Namba -> KIX)',
    from: 'Osaka Namba Station',
    to: 'Kansai International Airport (KIX)',
    departureInterval: 'Every 30 minutes',
    typicalDeparture: '14:00',
    duration: '38m',
    cost: 1490,
    currency: 'JPY',
    seatClass: 'Super Seat',
    notes: 'Distinctive retro-futuristic cobalt blue aerodynamic exterior with circular airplane-style windows.',
    tags: ['Airport Transfer', 'Iconic'],
  },
];

/**
 * Searches transit options between two points.
 */
export function searchTransit({ from, to } = {}) {
  if (!from && !to) return TRANSIT_CATALOG;
  const qFrom = (from || '').toLowerCase();
  const qTo = (to || '').toLowerCase();

  const matches = TRANSIT_CATALOG.filter(t => 
    (!qFrom || t.from.toLowerCase().includes(qFrom)) &&
    (!qTo || t.to.toLowerCase().includes(qTo))
  );

  return matches.length > 0 ? matches : TRANSIT_CATALOG;
}
