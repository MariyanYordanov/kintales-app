import { useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { formatDuration } from '../../lib/utils/dateFormatter';
import { colors } from '../../constants/colors';

export default function AudioPlayer({ uri, title, durationSeconds, onDelete }) {
  const { t } = useTranslation();
  const {
    loadSound,
    play,
    pause,
    seekTo,
    unload,
    isLoaded,
    isPlaying,
    positionMs,
    durationMs,
  } = useAudioPlayer();

  const barLayoutRef = useRef({ x: 0, width: 0 });

  useEffect(() => {
    if (uri) {
      loadSound(uri);
    }
    return () => { unload(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- loadSound/unload are stable
  }, [uri]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const handleSeek = useCallback((event) => {
    const { locationX } = event.nativeEvent;
    const totalDuration = durationMs || (durationSeconds * 1000) || 0;
    if (totalDuration === 0 || barLayoutRef.current.width === 0) return;

    const ratio = Math.max(0, Math.min(1, locationX / barLayoutRef.current.width));
    seekTo(Math.floor(ratio * totalDuration));
  }, [durationMs, durationSeconds, seekTo]);

  const handleBarLayout = useCallback((event) => {
    const { x, width } = event.nativeEvent.layout;
    barLayoutRef.current = { x, width };
  }, []);

  const handleDelete = useCallback(() => {
    if (!onDelete) return;

    Alert.alert(
      t('common.delete'),
      t('media.deleteAudioConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: onDelete },
      ],
    );
  }, [onDelete, t]);

  const totalDuration = durationMs || (durationSeconds ? durationSeconds * 1000 : 0);
  const progress = totalDuration > 0 ? positionMs / totalDuration : 0;
  const currentTime = formatDuration(Math.floor(positionMs / 1000));
  const totalTime = formatDuration(durationSeconds || Math.floor(totalDuration / 1000));

  return (
    <View className="bg-surface rounded-2xl px-4 py-3">
      <View className="flex-row items-center">
        {/* Play/Pause Button */}
        <TouchableOpacity
          onPress={handlePlayPause}
          disabled={!isLoaded}
          className="w-12 h-12 rounded-full bg-primary items-center justify-center mr-3"
          style={!isLoaded ? { opacity: 0.5 } : undefined}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? t('media.pauseRecording') : t('media.preview')}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={22}
            color="#FFFFFF"
            style={isPlaying ? undefined : { marginLeft: 2 }}
          />
        </TouchableOpacity>

        {/* Info + Progress */}
        <View className="flex-1">
          {title ? (
            <Text className="font-sans-medium text-base text-text-primary mb-1" numberOfLines={1}>
              {title}
            </Text>
          ) : null}

          {/* Progress Bar */}
          <Pressable
            onPress={handleSeek}
            onLayout={handleBarLayout}
            className="h-6 justify-center"
            accessibilityRole="adjustable"
            accessibilityLabel={`${currentTime} / ${totalTime}`}
          >
            <View className="h-1.5 bg-surface-secondary rounded-full overflow-hidden">
              <View
                className="h-full bg-primary rounded-full"
                style={{ width: `${Math.min(progress * 100, 100)}%` }}
              />
            </View>
          </Pressable>

          {/* Time */}
          <View className="flex-row justify-between mt-0.5">
            <Text className="font-sans text-xs text-text-muted">{currentTime}</Text>
            <Text className="font-sans text-xs text-text-muted">{totalTime}</Text>
          </View>
        </View>

        {/* Delete Button */}
        {onDelete ? (
          <TouchableOpacity
            onPress={handleDelete}
            className="w-10 h-10 items-center justify-center ml-2"
            accessibilityRole="button"
            accessibilityLabel={t('common.delete')}
          >
            <Ionicons name="trash-outline" size={20} color={colors.text.muted} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
