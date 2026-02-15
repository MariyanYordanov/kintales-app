import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../profile/Avatar';
import {
  getEventIcon,
  getEventColor,
  getEventMessageKey,
  getEventMessageParams,
  formatEventDate,
} from '../../lib/utils/eventHelpers';

export default function EventCard({ event, relativeMeta, onPress }) {
  const { t } = useTranslation();

  const icon = getEventIcon(event.type);
  const color = getEventColor(event.type);
  const isDeceased = relativeMeta?.status === 'DECEASED';
  const messageKey = getEventMessageKey(event, isDeceased);
  const messageParams = getEventMessageParams(event);
  const dateLabel = formatEventDate(event.date, t);

  return (
    <TouchableOpacity
      onPress={() => onPress(event.relativeId)}
      className="bg-surface rounded-2xl p-4 mb-2"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
      }}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={t(messageKey, messageParams)}
    >
      <View className="flex-row items-center">
        {/* Event type icon */}
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Ionicons name={icon} size={20} color={color} />
        </View>

        {/* Event text */}
        <View className="flex-1 ml-3 mr-3">
          <Text className="font-sans-semibold text-sm text-text-primary leading-5" numberOfLines={2}>
            {t(messageKey, messageParams)}
          </Text>
          <Text className="font-sans text-xs text-text-muted mt-0.5">
            {dateLabel}
          </Text>
        </View>

        {/* Person avatar */}
        <Avatar
          source={relativeMeta?.avatarUrl ? { uri: relativeMeta.avatarUrl } : null}
          name={event.relativeName}
          size={40}
        />
      </View>
    </TouchableOpacity>
  );
}
