import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../profile/Avatar';
import { getEntryIcon } from '../../lib/utils/timelineHelpers';
import { colors } from '../../constants/colors';

const MONTH_KEYS = [
  '', 'months.1', 'months.2', 'months.3', 'months.4',
  'months.5', 'months.6', 'months.7', 'months.8',
  'months.9', 'months.10', 'months.11', 'months.12',
];

export default function TimelineEntry({ entry, sepiaOpacity }) {
  const { t } = useTranslation();

  const icon = useMemo(() => getEntryIcon(entry.type), [entry.type]);

  const title = useMemo(() => {
    switch (entry.type) {
      case 'birth':
        return t('timeline.birthOf', { name: entry.personName });
      case 'death':
        return t('timeline.deathOf', { name: entry.personName });
      case 'marriage':
        return t('timeline.marriageOf', { nameA: entry.personAName, nameB: entry.personBName });
      case 'story':
        return entry.personName
          ? t('timeline.storyAbout', { name: entry.personName })
          : t('timeline.storyGeneral');
      default:
        return '';
    }
  }, [entry, t]);

  const monthLabel = entry.date.month
    ? t(MONTH_KEYS[entry.date.month])
    : null;

  const dayLabel = entry.date.day ? String(entry.date.day) : null;

  const showAvatar = entry.type !== 'marriage' && entry.personName;

  return (
    <View
      className="bg-surface rounded-2xl mb-3 overflow-hidden"
      style={{ position: 'relative' }}
    >
      {/* Sepia overlay */}
      {sepiaOpacity > 0 ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#D4A574',
            opacity: sepiaOpacity,
            borderRadius: 16,
          }}
          pointerEvents="none"
        />
      ) : null}

      <View className="flex-row p-4">
        {/* Date column */}
        <View style={{ width: 60 }} className="items-center">
          <Text className="font-sans-bold text-lg text-text-primary">
            {entry.date.year}
          </Text>
          {monthLabel ? (
            <Text className="font-sans text-xs text-text-muted">
              {dayLabel ? `${dayLabel} ${monthLabel}` : monthLabel}
            </Text>
          ) : null}
        </View>

        {/* Type icon */}
        <View className="mx-3 mt-1">
          <Ionicons name={icon.name} size={20} color={icon.color} />
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text className="font-sans-semibold text-base text-text-primary">
            {title}
          </Text>

          {/* Story preview */}
          {entry.type === 'story' && entry.content ? (
            <Text
              className="font-sans text-sm text-text-secondary mt-1 leading-5"
              numberOfLines={3}
            >
              {entry.content}
            </Text>
          ) : null}

          {/* Media indicators for stories */}
          {entry.type === 'story' && (entry.hasPhotos || entry.hasAudio) ? (
            <View className="flex-row items-center mt-1.5">
              {entry.hasPhotos ? (
                <View className="flex-row items-center mr-3">
                  <Ionicons name="image-outline" size={14} color={colors.text.muted} />
                </View>
              ) : null}
              {entry.hasAudio ? (
                <View className="flex-row items-center">
                  <Ionicons name="mic-outline" size={14} color={colors.text.muted} />
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Person avatar (for birth/death/story entries) */}
          {showAvatar ? (
            <View className="flex-row items-center mt-2">
              <Avatar
                source={entry.avatarUrl ? { uri: entry.avatarUrl } : null}
                name={entry.personName}
                size={24}
              />
              <Text className="font-sans text-xs text-text-muted ml-2">
                {entry.personName}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
