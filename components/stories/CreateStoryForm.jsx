import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';
import { usePhotoPicker } from '../../hooks/usePhotoPicker';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { createStory } from '../../services/stories.service';
import { formatDuration } from '../../lib/utils/dateFormatter';
import TextInput from '../ui/TextInput';
import Button from '../ui/Button';
import PersonPicker from '../ui/PersonPicker';
import AudioPlayer from '../media/AudioPlayer';
import { colors } from '../../constants/colors';
import { AUDIO_MAX_SIZE_BYTES } from '../../constants/media';

const MAX_PHOTOS = 5;
const MAX_AUDIO = 5;
const CONTENT_MAX = 10000;

export default function CreateStoryForm({ treeId, relatives, onSuccess, onCancel }) {
  const { t } = useTranslation();
  const { pickFromCamera, pickPhotos } = usePhotoPicker();
  const {
    startRecording,
    stopRecording,
    cancelRecording,
    isRecording,
    isPaused,
    durationMs,
    pauseRecording,
    resumeRecording,
  } = useAudioRecorder();

  const [content, setContent] = useState('');
  const [relativeId, setRelativeId] = useState(null);
  const [photos, setPhotos] = useState([]); // [{ uri }]
  const [audioFiles, setAudioFiles] = useState([]); // [{ uri, name }]
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);

  // ── Photo actions ──

  const handleCamera = useCallback(async () => {
    const result = await pickFromCamera();
    if (result && result.length > 0) {
      setPhotos((prev) => {
        const remaining = MAX_PHOTOS - prev.length;
        return [...prev, ...result.slice(0, remaining)];
      });
    }
  }, [pickFromCamera]);

  const handleGallery = useCallback(async () => {
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) return;

    const result = await pickPhotos({ multiple: true });
    if (result && result.length > 0) {
      setPhotos((prev) => {
        const slots = MAX_PHOTOS - prev.length;
        return [...prev, ...result.slice(0, slots)];
      });
    }
  }, [pickPhotos, photos.length]);

  const handleAddPhoto = useCallback(() => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('stories.camera'), t('stories.gallery'), t('common.cancel')],
          cancelButtonIndex: 2,
        },
        (index) => {
          if (index === 0) handleCamera();
          if (index === 1) handleGallery();
        },
      );
    } else {
      Alert.alert(
        t('stories.photos'),
        null,
        [
          { text: t('stories.camera'), onPress: handleCamera },
          { text: t('stories.gallery'), onPress: handleGallery },
          { text: t('common.cancel'), style: 'cancel' },
        ],
      );
    }
  }, [handleCamera, handleGallery, t]);

  const removePhoto = useCallback((index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ── Audio actions ──

  const handleStartRecording = useCallback(async () => {
    const result = await startRecording();
    if (!result.granted) {
      Alert.alert(t('common.error'), t('media.audioPermissionRequired'));
      return;
    }
    if (result.error) {
      Alert.alert(t('common.error'), t('stories.createError'));
      return;
    }
    setShowRecorder(true);
  }, [startRecording, t]);

  const handleCancelRecording = useCallback(async () => {
    await cancelRecording();
    setShowRecorder(false);
  }, [cancelRecording]);

  const handleSaveRecording = useCallback(async () => {
    const result = await stopRecording();
    setShowRecorder(false);
    if (result?.uri) {
      setAudioFiles((prev) => {
        if (prev.length >= MAX_AUDIO) return prev;
        return [...prev, { uri: result.uri, name: `recording-${prev.length + 1}.m4a` }];
      });
    }
  }, [stopRecording]);

  const handlePickAudioFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      if (file.size > AUDIO_MAX_SIZE_BYTES) {
        Alert.alert(t('common.error'), t('media.uploadError'));
        return;
      }

      setAudioFiles((prev) => {
        if (prev.length >= MAX_AUDIO) return prev;
        return [...prev, { uri: file.uri, name: file.name }];
      });
    } catch (err) {
      console.error('Failed to pick audio file:', err);
    }
  }, [t]);

  const removeAudio = useCallback((index) => {
    setAudioFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ── Submit ──

  const handleSubmit = useCallback(async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      Alert.alert(null, t('stories.contentRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      const files = [
        ...photos.map((p) => ({ uri: p.uri, type: 'photo' })),
        ...audioFiles.map((a) => ({ uri: a.uri, type: 'audio' })),
      ];

      const { data } = await createStory(treeId, trimmedContent, relativeId, files);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(null, t('stories.createSuccess'));
      if (onSuccess) onSuccess(data.data);
    } catch (err) {
      console.error('Failed to create story:', err);
      Alert.alert(t('common.error'), t('stories.createError'));
    } finally {
      setIsSubmitting(false);
    }
  }, [content, photos, audioFiles, treeId, relativeId, onSuccess, t]);

  const canSubmit = content.trim().length > 0 && !isSubmitting;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-4">
          {/* Text input */}
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder={t('stories.contentPlaceholder')}
            multiline
            numberOfLines={6}
            maxLength={CONTENT_MAX}
            icon="create-outline"
            testID="story-content-input"
          />

          {/* Person picker */}
          <PersonPicker
            relatives={relatives}
            value={relativeId}
            onChange={setRelativeId}
            label={t('stories.storyFor')}
            placeholder={t('stories.selectPerson')}
          />

          {/* Photos section */}
          <View className="mt-2 mb-4">
            <Text className="font-sans-semibold text-base text-text-primary mb-2">
              {t('stories.photos')} ({photos.length}/{MAX_PHOTOS})
            </Text>

            {photos.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
                className="mb-3"
              >
                {photos.map((photo, index) => (
                  <View key={photo.uri} className="relative">
                    <Image
                      source={{ uri: photo.uri }}
                      style={{ width: 100, height: 100, borderRadius: 12 }}
                      contentFit="cover"
                    />
                    <TouchableOpacity
                      onPress={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-error items-center justify-center"
                      accessibilityRole="button"
                      accessibilityLabel={t('stories.removePhoto')}
                    >
                      <Ionicons name="close" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            ) : null}

            {photos.length < MAX_PHOTOS ? (
              <Button
                title={t('stories.addPhoto')}
                onPress={handleAddPhoto}
                variant="outline"
                size="md"
                icon="images-outline"
              />
            ) : null}
          </View>

          {/* Audio section */}
          <View className="mb-4">
            <Text className="font-sans-semibold text-base text-text-primary mb-2">
              {t('stories.audio')} ({audioFiles.length}/{MAX_AUDIO})
            </Text>

            {audioFiles.map((audio, index) => (
              <View key={audio.uri} className="mb-2">
                <AudioPlayer
                  uri={audio.uri}
                  title={audio.name}
                  durationSeconds={0}
                  onDelete={() => removeAudio(index)}
                />
              </View>
            ))}

            {/* Inline recorder */}
            {showRecorder ? (
              <View className="bg-surface-secondary rounded-2xl p-4 mb-3">
                <View className="items-center">
                  <Text className="font-sans-bold text-xl text-text-primary mb-1">
                    {formatDuration(Math.floor(durationMs / 1000))}
                  </Text>
                  <Text className="font-sans text-sm text-text-muted mb-4">
                    {isPaused ? t('media.paused') : t('media.recording')}
                  </Text>
                  <View className="flex-row items-center">
                    <TouchableOpacity
                      onPress={handleCancelRecording}
                      className="w-10 h-10 rounded-full bg-surface items-center justify-center mx-3"
                      accessibilityRole="button"
                      accessibilityLabel={t('common.cancel')}
                    >
                      <Ionicons name="close" size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={isPaused ? resumeRecording : pauseRecording}
                      className="w-10 h-10 rounded-full bg-surface items-center justify-center mx-3"
                      accessibilityRole="button"
                    >
                      <Ionicons
                        name={isPaused ? 'play' : 'pause'}
                        size={20}
                        color={colors.text.secondary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSaveRecording}
                      className="w-12 h-12 rounded-full bg-error items-center justify-center mx-3"
                      accessibilityRole="button"
                      accessibilityLabel={t('media.stopRecording')}
                    >
                      <View className="w-5 h-5 rounded bg-white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : null}

            {audioFiles.length < MAX_AUDIO && !showRecorder ? (
              <View className="flex-row" style={{ gap: 8 }}>
                <View className="flex-1">
                  <Button
                    title={t('stories.record')}
                    onPress={handleStartRecording}
                    variant="outline"
                    size="md"
                    icon="mic-outline"
                  />
                </View>
                <View className="flex-1">
                  <Button
                    title={t('stories.uploadFile')}
                    onPress={handlePickAudioFile}
                    variant="outline"
                    size="md"
                    icon="document-outline"
                  />
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* Sticky publish button */}
      <View className="px-6 py-4 border-t border-border bg-background">
        <Button
          title={t('stories.publishStory')}
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!canSubmit}
          icon="send-outline"
          testID="story-save-button"
        />
      </View>
    </KeyboardAvoidingView>
  );
}
