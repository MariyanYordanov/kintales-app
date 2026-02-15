import { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, Animated, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { uploadAudio } from '../../services/media.service';
import { formatDuration } from '../../lib/utils/dateFormatter';
import TextInput from '../ui/TextInput';
import Button from '../ui/Button';
import AudioPlayer from './AudioPlayer';
import { colors } from '../../constants/colors';

const BAR_COUNT = 5;
const MIN_BAR_HEIGHT = 8;
const MAX_BAR_HEIGHT = 48;

function MeteringBars({ metering, isActive }) {
  const bars = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(MIN_BAR_HEIGHT)),
  ).current;

  useEffect(() => {
    if (!isActive) {
      bars.forEach((bar) => {
        Animated.timing(bar, { toValue: MIN_BAR_HEIGHT, duration: 200, useNativeDriver: false }).start();
      });
      return;
    }

    // metering ranges from -160 (silent) to 0 (max)
    const normalized = Math.max(0, Math.min(1, (metering + 60) / 60));

    bars.forEach((bar, i) => {
      const offset = (i - Math.floor(BAR_COUNT / 2)) * 0.1;
      const height = MIN_BAR_HEIGHT + (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT) * Math.max(0, Math.min(1, normalized + offset));
      Animated.timing(bar, { toValue: height, duration: 100, useNativeDriver: false }).start();
    });
  }, [metering, isActive, bars]);

  return (
    <View className="flex-row items-center justify-center" style={{ height: MAX_BAR_HEIGHT + 8 }}>
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          className="bg-primary rounded-full mx-1"
          style={{ width: 6, height: bar }}
        />
      ))}
    </View>
  );
}

export default function AudioRecorder({ relativeId, onSuccess, onCancel }) {
  const { t } = useTranslation();
  const {
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    isRecording,
    isPaused,
    durationMs,
    metering,
    recordingUri,
    recordingDurationMs,
  } = useAudioRecorder();

  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle | recording | preview

  const handleStart = useCallback(async () => {
    const result = await startRecording();
    if (!result.granted) {
      Alert.alert(t('common.error'), t('media.audioPermissionRequired'));
      return;
    }
    if (result.error) {
      Alert.alert(t('common.error'), t('media.uploadError'));
      return;
    }
    setPhase('recording');
  }, [startRecording, t]);

  const handleStop = useCallback(async () => {
    await stopRecording();
    setPhase('preview');
  }, [stopRecording]);

  const handleCancel = useCallback(async () => {
    await cancelRecording();
    setPhase('idle');
    setTitle('');
    if (onCancel) onCancel();
  }, [cancelRecording, onCancel]);

  const handleUpload = useCallback(async () => {
    if (!recordingUri) return;

    setIsUploading(true);
    try {
      await uploadAudio(relativeId, recordingUri, title.trim() || undefined);
      Alert.alert(t('common.done'), t('media.uploadSuccess'));
      setPhase('idle');
      setTitle('');
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Failed to upload audio:', err);
      Alert.alert(t('common.error'), t('media.uploadError'));
    } finally {
      setIsUploading(false);
    }
  }, [recordingUri, relativeId, title, t, onSuccess]);

  const handleReRecord = useCallback(async () => {
    setPhase('idle');
    setTitle('');
  }, []);

  // Idle state
  if (phase === 'idle') {
    return (
      <View className="items-center py-8">
        <MeteringBars metering={-160} isActive={false} />

        <Text className="font-sans text-base text-text-secondary mt-4 mb-6">
          {t('media.record')}
        </Text>

        <TouchableOpacity
          onPress={handleStart}
          className="w-16 h-16 rounded-full bg-error items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel={t('media.record')}
        >
          <View className="w-6 h-6 rounded-full bg-white" />
        </TouchableOpacity>
      </View>
    );
  }

  // Recording state
  if (phase === 'recording') {
    return (
      <View className="items-center py-8">
        <MeteringBars metering={metering} isActive={isRecording && !isPaused} />

        <Text className="font-sans-bold text-2xl text-text-primary mt-4 mb-2">
          {formatDuration(Math.floor(durationMs / 1000))}
        </Text>

        <Text className="font-sans text-sm text-text-secondary mb-6">
          {isPaused ? t('media.paused') : t('media.recording')}
        </Text>

        <View className="flex-row items-center">
          {/* Cancel */}
          <TouchableOpacity
            onPress={handleCancel}
            className="w-12 h-12 rounded-full bg-surface-secondary items-center justify-center mx-4"
            accessibilityRole="button"
            accessibilityLabel={t('common.cancel')}
          >
            <Ionicons name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>

          {/* Pause/Resume */}
          <TouchableOpacity
            onPress={isPaused ? resumeRecording : pauseRecording}
            className="w-12 h-12 rounded-full bg-surface-secondary items-center justify-center mx-4"
            accessibilityRole="button"
            accessibilityLabel={isPaused ? t('media.resumeRecording') : t('media.pauseRecording')}
          >
            <Ionicons
              name={isPaused ? 'play' : 'pause'}
              size={24}
              color={colors.text.secondary}
            />
          </TouchableOpacity>

          {/* Stop */}
          <TouchableOpacity
            onPress={handleStop}
            className="w-16 h-16 rounded-full bg-error items-center justify-center mx-4"
            accessibilityRole="button"
            accessibilityLabel={t('media.stopRecording')}
          >
            <View className="w-6 h-6 rounded bg-white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Preview state
  return (
    <View className="py-4">
      <Text className="font-sans-semibold text-base text-text-primary mb-3">
        {t('media.preview')}
      </Text>

      {recordingUri ? (
        <AudioPlayer
          uri={recordingUri}
          title={title || t('media.preview')}
          durationSeconds={Math.floor(recordingDurationMs / 1000)}
        />
      ) : null}

      <View className="mt-4">
        <TextInput
          label={t('media.title')}
          value={title}
          onChangeText={setTitle}
          placeholder={t('media.titlePlaceholder')}
          icon="text-outline"
          autoCapitalize="sentences"
        />
      </View>

      <View className="mt-4">
        <Button
          title={isUploading ? t('media.uploading') : t('common.save')}
          onPress={handleUpload}
          loading={isUploading}
          icon="cloud-upload-outline"
        />
      </View>

      <View className="mt-3">
        <Button
          title={t('media.record')}
          onPress={handleReRecord}
          variant="outline"
          icon="mic-outline"
          disabled={isUploading}
        />
      </View>
    </View>
  );
}
