/**
 * Category kind — distinguishes music stages from activity zones.
 *
 * The festival names activity areas with a "Zone" suffix (Art Zone, Kids Zone,
 * Workshop Zone); music stages (Kolo, Tok) don't. Music stages hold DJ "sets",
 * zones hold "events" (yoga, workshops, kids activities). Keep new zone names
 * ending in "Zone" and this classification stays correct with no code change.
 */

// True for activity zones (Art Zone, Workshop Zone, Kids Garden), false for
// music stages (Kolo, Tok). Matches "Zone" or "Garden".
export const isZone = (name) => /zone|garden/i.test(name || '');

// Display order for stages/zones (by underlying DB category name). Categories
// not listed sort after these, keeping their original order.
const STAGE_ORDER = ['Kolo', 'Tok', 'Art Zone', 'Workshop Zone', 'Kids Zone'];

// Display-label overrides (DB name → label shown in the app). The DB category is
// still "Kids Zone"; we present it as "Kids Garden" everywhere.
const STAGE_LABELS = { 'Kids Zone': 'Kids Garden' };

export const stageLabel = (name) => STAGE_LABELS[name] || name;

const rank = (name) => {
  const i = STAGE_ORDER.indexOf(name);
  return i < 0 ? STAGE_ORDER.length : i;
};

// Reorder + relabel categories once, so every consumer (Home grid, Lineup
// filter, empty-day messages, event detail) is consistent. Keeps id/color.
export const orderAndLabelCategories = (cats) =>
  [...(cats || [])]
    .sort((a, b) => rank(a.name) - rank(b.name))
    .map((c) => ({ ...c, name: stageLabel(c.name) }));

// The right noun for a category's scheduled items, pluralised by count.
export const itemNoun = (name, count) => {
  const one = isZone(name) ? 'event' : 'set';
  return count === 1 ? one : `${one}s`;
};
