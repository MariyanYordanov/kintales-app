import { colors } from '../../constants/colors';

// --- Icon mapping ---

const EVENT_ICONS = {
  BIRTHDAY: 'gift-outline',
  NAME_DAY: 'flower-outline',
  COMMEMORATION_40: 'flame-outline',
  COMMEMORATION_6M: 'flame-outline',
  COMMEMORATION_1Y: 'flame-outline',
  COMMEMORATION_ANNUAL: 'flame-outline',
  MARRIAGE_ANNIVERSARY: 'heart-outline',
  ON_THIS_DAY: 'calendar-outline',
};

export function getEventIcon(type) {
  return EVENT_ICONS[type] || 'ellipse-outline';
}

// --- Color mapping ---

const MARRIAGE_PINK = '#EC4899';

const EVENT_COLORS = {
  BIRTHDAY: colors.primary.DEFAULT,
  NAME_DAY: colors.success,
  COMMEMORATION_40: colors.secondary.DEFAULT,
  COMMEMORATION_6M: colors.secondary.DEFAULT,
  COMMEMORATION_1Y: colors.secondary.DEFAULT,
  COMMEMORATION_ANNUAL: colors.secondary.DEFAULT,
  MARRIAGE_ANNIVERSARY: MARRIAGE_PINK,
  ON_THIS_DAY: colors.text.secondary,
};

export function getEventColor(type) {
  return EVENT_COLORS[type] || colors.text.muted;
}

// --- Message key resolution ---

const EVENT_MESSAGE_KEYS = {
  BIRTHDAY: 'dashboard.eventBirthday',
  NAME_DAY: 'dashboard.eventNameDay',
  COMMEMORATION_40: 'dashboard.eventCommemoration40',
  COMMEMORATION_6M: 'dashboard.eventCommemoration6M',
  COMMEMORATION_1Y: 'dashboard.eventCommemoration1Y',
  COMMEMORATION_ANNUAL: 'dashboard.eventCommemorationAnnual',
  MARRIAGE_ANNIVERSARY: 'dashboard.eventMarriageAnniversary',
  ON_THIS_DAY: 'dashboard.eventOnThisDay',
};

export function getEventMessageKey(event, isDeceased = false) {
  if (event.type === 'BIRTHDAY') {
    const hasAge = event.metadata?.age != null;
    if (isDeceased) {
      return hasAge ? 'dashboard.eventBirthdayDeceased' : 'dashboard.eventBirthdayDeceasedNoAge';
    }
    return hasAge ? 'dashboard.eventBirthday' : 'dashboard.eventBirthdayNoAge';
  }
  return EVENT_MESSAGE_KEYS[event.type] || 'dashboard.eventBirthday';
}

export function getEventMessageParams(event) {
  const base = { name: event.relativeName };

  switch (event.type) {
    case 'BIRTHDAY':
      return { ...base, age: event.metadata?.age };
    case 'NAME_DAY':
      return { ...base, holiday: event.metadata?.holiday || '' };
    case 'MARRIAGE_ANNIVERSARY':
      return {
        ...base,
        years: event.metadata?.years,
        spouseName: event.metadata?.spouseName || '',
      };
    case 'ON_THIS_DAY': {
      const deathYear = event.metadata?.year;
      const yearsAgo = deathYear ? new Date().getFullYear() - deathYear : '';
      return { ...base, years: yearsAgo };
    }
    default:
      return base;
  }
}

// --- Date formatting ---

function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatEventDate(dateStr, t) {
  const todayStr = toDateStr(new Date());

  if (dateStr === todayStr) return t('dashboard.dateToday');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateStr === toDateStr(tomorrow)) return t('dashboard.dateTomorrow');

  const [, month, day] = dateStr.split('-').map(Number);
  return `${day} ${t(`months.${month}`)}`;
}

// --- Event grouping ---

export function groupEventsByPeriod(events) {
  const now = new Date();
  const todayStr = toDateStr(now);

  const day7 = new Date(now);
  day7.setDate(day7.getDate() + 7);
  const day7Str = toDateStr(day7);

  const day30 = new Date(now);
  day30.setDate(day30.getDate() + 30);
  const day30Str = toDateStr(day30);

  const today = [];
  const thisWeek = [];
  const thisMonth = [];

  for (const event of events) {
    if (event.date === todayStr) {
      today.push(event);
    } else if (event.date > todayStr && event.date <= day7Str) {
      thisWeek.push(event);
    } else if (event.date > day7Str && event.date <= day30Str) {
      thisMonth.push(event);
    }
  }

  return { today, thisWeek, thisMonth };
}

// --- Relatives map ---

export function buildRelativesMap(relatives) {
  const map = new Map();
  for (const rel of relatives) {
    map.set(rel.id, {
      fullName: rel.fullName,
      avatarUrl: rel.avatarUrl || null,
      status: rel.status,
    });
  }
  return map;
}

// --- Story prompt ---

export function pickStoryPromptRelative(relatives) {
  const living = relatives.filter((r) => r.status === 'ALIVE');
  if (living.length === 0) return null;

  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return living[seed % living.length];
}
