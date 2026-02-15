import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { uploadPhoto } from '../../services/media.service';
import { validatePhotoCaption, validatePhotoDate } from '../../lib/validators/mediaValidators';
import TextInput from '../ui/TextInput';
import PartialDatePicker from '../ui/PartialDatePicker';
import Button from '../ui/Button';
import { colors } from '../../constants/colors';

const THUMBNAIL_SIZE = 100;

function createEmptyMetadata() {
  return {
    caption: '',
    dateTakenYear: null,
    dateTakenMonth: null,
    dateTakenDay: null,
  };
}

function PhotoCard({ photo, metadata, errors, onChangeCaption, onChangeYear, onChangeMonth, onChangeDay, index, total }) {
  const { t } = useTranslation();

  return (
    <View className="bg-surface rounded-2xl p-4 mb-4">
      <View className="flex-row mb-3">
        <Image
          source={{ uri: photo.uri }}
          style={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE, borderRadius: 12 }}
          contentFit="cover"
          transition={200}
        />
        {total > 1 ? (
          <View className="ml-3 justify-center">
            <Text className="font-sans-medium text-sm text-text-secondary">
              {t('media.photoOf', { index: index + 1, total })}
            </Text>
          </View>
        ) : null}
      </View>

      <TextInput
        label={t('media.caption')}
        value={metadata.caption}
        onChangeText={onChangeCaption}
        placeholder={t('media.captionPlaceholder')}
        icon="text-outline"
        error={errors.caption ? t(errors.caption) : null}
        autoCapitalize="sentences"
      />

      <PartialDatePicker
        label={t('media.dateTaken')}
        year={metadata.dateTakenYear}
        month={metadata.dateTakenMonth}
        day={metadata.dateTakenDay}
        onChangeYear={onChangeYear}
        onChangeMonth={onChangeMonth}
        onChangeDay={onChangeDay}
        error={errors.date ? t(errors.date) : null}
      />
    </View>
  );
}

export default function PhotoUploadForm({ photos, relativeId, visible, onSuccess, onCancel }) {
  const { t } = useTranslation();

  const [metadataList, setMetadataList] = useState(
    () => photos.map(() => createEmptyMetadata()),
  );
  const [errorsList, setErrorsList] = useState(
    () => photos.map(() => ({ caption: null, date: null })),
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: photos.length });

  const updateMetadata = useCallback((index, field, value) => {
    setMetadataList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    // Clear related error
    setErrorsList((prev) => {
      const next = [...prev];
      const key = field === 'caption' ? 'caption' : 'date';
      next[index] = { ...next[index], [key]: null };
      return next;
    });
  }, []);

  const validateAll = useCallback(() => {
    let allValid = true;
    const newErrors = metadataList.map((meta) => {
      const captionResult = validatePhotoCaption(meta.caption);
      const dateResult = validatePhotoDate(
        meta.dateTakenYear, meta.dateTakenMonth, meta.dateTakenDay,
      );
      if (!captionResult.valid || !dateResult.valid) allValid = false;
      return {
        caption: captionResult.error,
        date: dateResult.error,
      };
    });
    setErrorsList(newErrors);
    return allValid;
  }, [metadataList]);

  const handleUpload = useCallback(async () => {
    if (!validateAll()) return;

    setIsUploading(true);
    let successCount = 0;
    const failedIndexes = [];

    for (let i = 0; i < photos.length; i++) {
      setUploadProgress({ current: i + 1, total: photos.length });

      try {
        const meta = metadataList[i];
        await uploadPhoto(relativeId, photos[i].uri, {
          caption: meta.caption.trim() || undefined,
          dateTakenYear: meta.dateTakenYear,
          dateTakenMonth: meta.dateTakenMonth,
          dateTakenDay: meta.dateTakenDay,
        });
        successCount++;
      } catch (err) {
        console.error(`Failed to upload photo ${i + 1}:`, err);
        failedIndexes.push(i + 1);
      }
    }

    setIsUploading(false);

    if (failedIndexes.length > 0) {
      const failedList = failedIndexes.map((i) => `#${i}`).join(', ');
      Alert.alert(
        t('common.error'),
        t('media.uploadPartialError', { success: successCount, total: photos.length, failed: failedList }),
      );
    } else {
      Alert.alert(t('common.done'), t('media.uploadSuccess'));
    }

    if (successCount > 0 && onSuccess) {
      onSuccess();
    }
  }, [photos, metadataList, relativeId, validateAll, t, onSuccess]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-border">
          <TouchableOpacity
            onPress={isUploading ? undefined : onCancel}
            className="p-2 mr-2"
            disabled={isUploading}
            accessibilityRole="button"
            accessibilityLabel={t('common.cancel')}
          >
            <Ionicons
              name="close"
              size={24}
              color={isUploading ? colors.text.muted : colors.text.primary}
            />
          </TouchableOpacity>
          <Text className="font-sans-bold text-xl text-text-primary flex-1">
            {t('media.addPhoto')}
          </Text>
        </View>

        {/* Upload Progress */}
        {isUploading ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
            <Text className="font-sans-medium text-base text-text-secondary mt-4">
              {t('media.uploadProgress', {
                current: uploadProgress.current,
                total: uploadProgress.total,
              })}
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="px-6 pt-4 pb-8">
              {photos.map((photo, index) => (
                <PhotoCard
                  key={photo.uri}
                  photo={photo}
                  metadata={metadataList[index]}
                  errors={errorsList[index]}
                  onChangeCaption={(v) => updateMetadata(index, 'caption', v)}
                  onChangeYear={(v) => updateMetadata(index, 'dateTakenYear', v)}
                  onChangeMonth={(v) => updateMetadata(index, 'dateTakenMonth', v)}
                  onChangeDay={(v) => updateMetadata(index, 'dateTakenDay', v)}
                  index={index}
                  total={photos.length}
                />
              ))}

              <View className="mt-2">
                <Button
                  title={t('common.save')}
                  onPress={handleUpload}
                  icon="cloud-upload-outline"
                />
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}
