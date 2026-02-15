import { buildRelativesMap } from './storyHelpers';

const STORY_PREVIEW_LENGTH = 120;

/**
 * Build a sort key from a partial date for chronological ordering.
 * year only → "YYYY-07-01", year+month → "YYYY-MM-15", full → "YYYY-MM-DD"
 */
export function buildSortKey(year, month, day) {
  const y = String(year).padStart(4, '0');
  const m = month != null ? String(month).padStart(2, '0') : '07';
  const d = day != null ? String(day).padStart(2, '0') : (month != null ? '15' : '01');
  return `${y}-${m}-${d}`;
}

/**
 * Extract birth entries from relatives array.
 */
export function extractBirthEntries(relatives) {
  if (!relatives) return [];

  return relatives
    .filter((r) => r.birthYear != null)
    .map((r) => ({
      type: 'birth',
      date: { year: r.birthYear, month: r.birthMonth || null, day: r.birthDay || null },
      sortKey: buildSortKey(r.birthYear, r.birthMonth, r.birthDay),
      personId: r.id,
      personName: r.fullName,
      avatarUrl: r.avatarUrl || null,
    }));
}

/**
 * Extract death entries from relatives array.
 */
export function extractDeathEntries(relatives) {
  if (!relatives) return [];

  return relatives
    .filter((r) => r.deathYear != null)
    .map((r) => ({
      type: 'death',
      date: { year: r.deathYear, month: r.deathMonth || null, day: r.deathDay || null },
      sortKey: buildSortKey(r.deathYear, r.deathMonth, r.deathDay),
      personId: r.id,
      personName: r.fullName,
      avatarUrl: r.avatarUrl || null,
    }));
}

/**
 * Extract marriage entries from relationships array.
 * Only includes 'spouse' type relationships with a marriage year.
 */
export function extractMarriageEntries(relationships, relativesMap) {
  if (!relationships || !relativesMap) return [];

  return relationships
    .filter((r) =>
      r.relationshipType === 'spouse' &&
      r.marriageYear != null &&
      r.personAId != null &&
      r.personBId != null,
    )
    .map((r) => {
      const personA = relativesMap.get(r.personAId);
      const personB = relativesMap.get(r.personBId);
      return {
        type: 'marriage',
        date: { year: r.marriageYear, month: r.marriageMonth || null, day: r.marriageDay || null },
        sortKey: buildSortKey(r.marriageYear, r.marriageMonth, r.marriageDay),
        personAId: r.personAId,
        personBId: r.personBId,
        personAName: personA?.fullName || '?',
        personBName: personB?.fullName || '?',
      };
    });
}

/**
 * Extract story entries from stories array.
 */
export function extractStoryEntries(stories, relativesMap) {
  if (!stories) return [];

  return stories.map((s) => {
    const created = new Date(s.createdAt);
    const year = created.getFullYear();
    const month = created.getMonth() + 1;
    const day = created.getDate();
    const attachments = s.attachments || [];
    const linkedPerson = s.relativeId ? relativesMap?.get(s.relativeId) : null;

    return {
      type: 'story',
      date: { year, month, day },
      sortKey: buildSortKey(year, month, day),
      storyId: s.id,
      personId: s.relativeId || null,
      personName: linkedPerson?.fullName || null,
      avatarUrl: linkedPerson?.avatarUrl || null,
      content: s.content.length > STORY_PREVIEW_LENGTH
        ? `${s.content.slice(0, STORY_PREVIEW_LENGTH)}...`
        : s.content,
      hasPhotos: attachments.some((a) => a.fileType === 'photo'),
      hasAudio: attachments.some((a) => a.fileType === 'audio'),
    };
  });
}

/**
 * Build a complete timeline from all data sources.
 */
export function buildTimeline(relatives, relationships, stories) {
  const relativesMap = buildRelativesMap(relatives);

  return [
    ...extractBirthEntries(relatives),
    ...extractDeathEntries(relatives),
    ...extractMarriageEntries(relationships, relativesMap),
    ...extractStoryEntries(stories, relativesMap),
  ];
}

/**
 * Filter entries by year range (inclusive).
 */
export function filterByYearRange(entries, fromYear, toYear) {
  if (fromYear == null && toYear == null) return entries;

  return entries.filter((e) => {
    if (fromYear != null && e.date.year < fromYear) return false;
    if (toYear != null && e.date.year > toYear) return false;
    return true;
  });
}

/**
 * Filter entries by person ID.
 * For marriages, matches if either personA or personB matches.
 */
export function filterByPerson(entries, personId) {
  if (!personId) return entries;

  return entries.filter((e) => {
    if (e.personId === personId) return true;
    if (e.type === 'marriage') {
      return e.personAId === personId || e.personBId === personId;
    }
    return false;
  });
}

/**
 * Sort entries by date.
 * @param {'desc'|'asc'} direction - 'desc' = newest first, 'asc' = oldest first
 */
export function sortEntries(entries, direction = 'desc') {
  return [...entries].sort((a, b) => {
    const cmp = a.sortKey.localeCompare(b.sortKey);
    return direction === 'desc' ? -cmp : cmp;
  });
}

/**
 * Compute the min and max year from timeline entries.
 */
export function computeYearRange(entries) {
  if (entries.length === 0) return { minYear: null, maxYear: null };

  let minYear = Infinity;
  let maxYear = -Infinity;

  for (const e of entries) {
    if (e.date.year < minYear) minYear = e.date.year;
    if (e.date.year > maxYear) maxYear = e.date.year;
  }

  return { minYear, maxYear };
}

/**
 * Compute sepia overlay opacity for a timeline entry.
 * Older entries get warmer (higher opacity), newer ones are clear.
 * Linear interpolation: 0 for newest, MAX_SEPIA for oldest.
 */
const MAX_SEPIA = 0.12;

export function computeSepiaOpacity(entryYear, minYear, maxYear) {
  if (minYear == null || maxYear == null || minYear === maxYear) return 0;
  const range = maxYear - minYear;
  const age = maxYear - entryYear;
  return Math.max(0, Math.min(MAX_SEPIA, (age / range) * MAX_SEPIA));
}

/**
 * Get icon name and color for a timeline entry type.
 */
export function getEntryIcon(type) {
  switch (type) {
    case 'birth':
      return { name: 'flower-outline', color: '#22C55E' };
    case 'death':
      return { name: 'flame-outline', color: '#A8A29E' };
    case 'marriage':
      return { name: 'heart-outline', color: '#EF4444' };
    case 'story':
      return { name: 'book-outline', color: '#8B5CF6' };
    default:
      return { name: 'ellipse-outline', color: '#A8A29E' };
  }
}
