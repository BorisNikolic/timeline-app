/**
 * Category kind — distinguishes music stages from activity zones.
 *
 * The festival names activity areas with a "Zone" suffix (Art Zone, Kids Zone,
 * Workshop Zone); music stages (Kolo, Tok) don't. Music stages hold DJ "sets",
 * zones hold "events" (yoga, workshops, kids activities). Keep new zone names
 * ending in "Zone" and this classification stays correct with no code change.
 */

// True for activity zones (Art/Kids/Workshop Zone), false for music stages.
export const isZone = (name) => /zone/i.test(name || '');

// The right noun for a category's scheduled items, pluralised by count.
export const itemNoun = (name, count) => {
  const one = isZone(name) ? 'event' : 'set';
  return count === 1 ? one : `${one}s`;
};
