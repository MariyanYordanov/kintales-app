import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration } from '../../lib/utils/dateFormatter';
import { colors } from '../../constants/colors';

function AudioItem({ recording }) {
  return (
    <View className="flex-row items-center bg-surface rounded-2xl px-4 py-3 mb-2">
      <View className="w-10 h-10 rounded-full bg-surface-secondary items-center justify-center mr-3">
        <Ionicons
          name="play-circle-outline"
          size={24}
          color={colors.text.muted}
        />
      </View>
      <View className="flex-1">
        <Text className="font-sans-medium text-base text-text-primary" numberOfLines={1}>
          {recording.title}
        </Text>
        <Text className="font-sans text-sm text-text-muted mt-0.5">
          {formatDuration(recording.durationSeconds)}
        </Text>
      </View>
    </View>
  );
}

function SkeletonItem() {
  return (
    <View className="flex-row items-center bg-surface-secondary rounded-2xl px-4 py-3 mb-2">
      <View className="w-10 h-10 rounded-full bg-border mr-3" />
      <View className="flex-1">
        <View className="w-32 h-4 rounded bg-border mb-1" />
        <View className="w-16 h-3 rounded bg-border" />
      </View>
    </View>
  );
}

function EmptyState({ message }) {
  return (
    <View className="items-center py-6">
      <Ionicons name="musical-notes-outline" size={32} color={colors.text.muted} />
      <Text className="font-sans text-sm text-text-muted mt-2 text-center">
        {message}
      </Text>
    </View>
  );
}

export default function AudioList({ recordings, isLoading }) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <View>
        <SkeletonItem />
        <SkeletonItem />
      </View>
    );
  }

  if (!recordings || recordings.length === 0) {
    return <EmptyState message={t('person.noAudio')} />;
  }

  return (
    <View>
      {recordings.map((rec) => (
        <AudioItem key={rec.id} recording={rec} />
      ))}
    </View>
  );
}
