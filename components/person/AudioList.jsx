import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import AudioPlayer from '../media/AudioPlayer';
import { formatDuration } from '../../lib/utils/dateFormatter';
import { colors } from '../../constants/colors';

function InactiveItem({ recording, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-surface rounded-2xl px-4 py-3 mb-2"
      accessibilityRole="button"
      accessibilityLabel={`${recording.title || ''} ${formatDuration(recording.durationSeconds)}`}
    >
      <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
        <Ionicons
          name="play-circle-outline"
          size={24}
          color={colors.primary.DEFAULT}
        />
      </View>
      <View className="flex-1">
        <Text className="font-sans-medium text-base text-text-primary" numberOfLines={1}>
          {recording.title || formatDuration(recording.durationSeconds)}
        </Text>
        {recording.title ? (
          <Text className="font-sans text-sm text-text-muted mt-0.5">
            {formatDuration(recording.durationSeconds)}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
    </TouchableOpacity>
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

export default function AudioList({ recordings, isLoading, onAddPress, onAudioDeleted }) {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState(null);

  const handleItemPress = useCallback((id) => {
    setActiveId((prev) => (prev === id ? null : id));
  }, []);

  const handleDelete = useCallback((audioId) => {
    setActiveId(null);
    if (onAudioDeleted) onAudioDeleted(audioId);
  }, [onAudioDeleted]);

  if (isLoading) {
    return (
      <View>
        <SkeletonItem />
        <SkeletonItem />
      </View>
    );
  }

  const hasRecordings = recordings && recordings.length > 0;

  return (
    <View>
      {hasRecordings
        ? recordings.map((rec) =>
            activeId === rec.id ? (
              <View key={rec.id} className="mb-2">
                <AudioPlayer
                  uri={rec.fileUrl}
                  title={rec.title}
                  durationSeconds={rec.durationSeconds}
                  onDelete={onAudioDeleted ? () => handleDelete(rec.id) : undefined}
                />
              </View>
            ) : (
              <InactiveItem
                key={rec.id}
                recording={rec}
                onPress={() => handleItemPress(rec.id)}
              />
            ),
          )
        : <EmptyState message={t('person.noAudio')} />}

      {onAddPress ? (
        <TouchableOpacity
          onPress={onAddPress}
          className="flex-row items-center justify-center bg-transparent border-2 border-dashed border-border rounded-2xl px-4 py-3 mt-2"
          accessibilityRole="button"
          accessibilityLabel={t('media.addRecording')}
        >
          <Ionicons name="mic-outline" size={20} color={colors.text.muted} />
          <Text className="font-sans-medium text-sm text-text-muted ml-2">
            {t('media.addRecording')}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
