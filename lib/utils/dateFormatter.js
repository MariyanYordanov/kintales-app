/**
 * Pure date formatting utilities for person profiles.
 */

const MONTH_KEYS = [
  '', 'months.1', 'months.2', 'months.3', 'months.4',
  'months.5', 'months.6', 'months.7', 'months.8',
  'months.9', 'months.10', 'months.11', 'months.12',
];

/**
 * Format a life span string from a person's date fields.
 *
 * @param {object} person - { birthYear, deathYear }
 * @param {Function} t - i18n translate function
 * @returns {string|null} e.g. "1923 — 2001", "р. 1923", "† 2001", or null
 */
export function formatLifeSpan(person, t) {
  const { birthYear, deathYear } = person;

  if (birthYear != null && deathYear != null) {
    return `${birthYear} — ${deathYear}`;
  }
  if (birthYear != null) {
    return `${t('person.born')} ${birthYear}`;
  }
  if (deathYear != null) {
    return `${t('person.died')} ${deathYear}`;
  }
  return null;
}

/**
 * Format a partial date (year, optional month, optional day).
 *
 * @param {number|null} year
 * @param {number|null} month - 1-12
 * @param {number|null} day
 * @param {Function} t - i18n translate function
 * @returns {string|null} e.g. "15 януари 1923", "януари 1923", "1923", or null
 */
export function formatPartialDate(year, month, day, t) {
  if (year == null) return null;

  if (month != null && day != null) {
    return `${day} ${t(MONTH_KEYS[month])} ${year}`;
  }
  if (month != null) {
    return `${t(MONTH_KEYS[month])} ${year}`;
  }
  return String(year);
}

/**
 * Format seconds into MM:SS string.
 *
 * @param {number} seconds
 * @returns {string} e.g. "02:05"
 */
export function formatDuration(seconds) {
  const total = Math.max(0, Math.floor(seconds || 0));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
