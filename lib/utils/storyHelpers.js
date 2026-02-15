import { formatPartialDate } from './dateFormatter';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/**
 * Format a timestamp as relative time: "току-що", "преди 2 часа", etc.
 * Falls back to full date for older entries.
 */
export function formatRelativeTime(isoString, t) {
  if (!isoString) return '';

  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diff = now - then;

  if (diff < MINUTE) {
    return t('stories.justNow');
  }
  if (diff < HOUR) {
    const count = Math.floor(diff / MINUTE);
    return count === 1 ? t('stories.minuteAgo') : t('stories.minutesAgo', { count });
  }
  if (diff < DAY) {
    const count = Math.floor(diff / HOUR);
    return count === 1 ? t('stories.hourAgo') : t('stories.hoursAgo', { count });
  }
  if (diff < WEEK) {
    const count = Math.floor(diff / DAY);
    return count === 1 ? t('stories.dayAgo') : t('stories.daysAgo', { count });
  }
  if (diff < 4 * WEEK) {
    const count = Math.floor(diff / WEEK);
    return count === 1 ? t('stories.weekAgo') : t('stories.weeksAgo', { count });
  }

  // Older than ~1 month → show full date
  const date = new Date(isoString);
  return formatPartialDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    t,
  );
}

/**
 * Get author display info from authorId.
 * MVP: show current user's name or "Член на семейството" for others.
 */
export function getAuthorInfo(authorId, currentUser, t) {
  if (authorId === currentUser?.id) {
    return {
      name: currentUser.fullName,
      avatarUrl: currentUser.avatarUrl || null,
    };
  }
  return {
    name: t('stories.member'),
    avatarUrl: null,
  };
}

/**
 * Get linked relative's name from relativesMap.
 */
export function getRelativeName(relativeId, relativesMap) {
  if (!relativeId || !relativesMap) return null;
  return relativesMap.get(relativeId)?.fullName || null;
}

/**
 * Separate story attachments into photos and audio.
 */
export function separateAttachments(attachments) {
  if (!attachments || attachments.length === 0) {
    return { photos: [], audio: [] };
  }
  return {
    photos: attachments.filter((a) => a.fileType === 'photo'),
    audio: attachments.filter((a) => a.fileType === 'audio'),
  };
}

/**
 * Build a Map of relativeId → { fullName, avatarUrl } from relatives array.
 */
export function buildRelativesMap(relatives) {
  const map = new Map();
  if (!relatives) return map;
  for (const r of relatives) {
    map.set(r.id, { fullName: r.fullName, avatarUrl: r.avatarUrl || null });
  }
  return map;
}
