import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { uploadAudio } from '../../../services/media.service';
import AudioRecorder from '../../../components/media/AudioRecorder';
import AudioPlayer from '../../../components/media/AudioPlayer';
import TextInput from '../../../components/ui/TextInput';
import Button from '../../../components/ui/Button';
import { colors } from '../../../constants/colors';
import { AUDIO_MAX_SIZE_BYTES } from '../../../constants/media';

function SegmentedControl({ options, selectedIndex, onSelect }) {
  return (
    <View className="flex-row bg-surface-secondary rounded-2xl p-1">
      {options.map((option, index) => {
        const isSelected = index === selectedIndex;
        return (
          <TouchableOpacity
            key={option.key}
            onPress={() => onSelect(index)}
            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl ${
              isSelected ? 'bg-surface' : ''
            }`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
          >
            <Ionicons
              name={option.icon}
              size={18}
              color={isSelected ? colors.primary.DEFAULT : colors.text.muted}
            />
            <Text
              className={`ml-2 font-sans-medium text-sm ${
                isSelected ? 'text-primary' : 'text-text-muted'
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function UploadFileTab({ relativeId, onSuccess }) {
  const { t } = useTranslation();
  const [fileUri, setFileUri] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handlePickFile = useCallback(async () => {
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

      setFileUri(file.uri);
      setFileName(file.name);
      if (!title && file.name) {
        const nameWithoutExt = file.name.replace(/\.[^.]+$/, '');
        setTitle(nameWithoutExt);
      }
    } catch (err) {
      console.error('Failed to pick file:', err);
    }
  }, [title, t]);

  const handleUpload = useCallback(async () => {
    if (!fileUri) return;

    setIsUploading(true);
    try {
      await uploadAudio(relativeId, fileUri, title.trim() || undefined);
      Alert.alert(t('common.done'), t('media.uploadSuccess'));
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Failed to upload audio:', err);
      Alert.alert(t('common.error'), t('media.uploadError'));
    } finally {
      setIsUploading(false);
    }
  }, [fileUri, relativeId, title, t, onSuccess]);

  return (
    <View className="pt-6">
      {/* Pick File Button */}
      <Button
        title={t('media.pickFile')}
        onPress={handlePickFile}
        variant="outline"
        icon="document-outline"
        disabled={isUploading}
      />

      {/* Selected File */}
      {fileName ? (
        <View className="flex-row items-center bg-surface rounded-2xl px-4 py-3 mt-4">
          <Ionicons name="musical-note-outline" size={20} color={colors.primary.DEFAULT} />
          <Text className="font-sans-medium text-sm text-text-primary ml-2 flex-1" numberOfLines={1}>
            {fileName}
          </Text>
        </View>
      ) : (
        <View className="items-center py-8">
          <Ionicons name="cloud-upload-outline" size={48} color={colors.text.muted} />
          <Text className="font-sans text-sm text-text-muted mt-2">
            {t('media.noFileSelected')}
          </Text>
        </View>
      )}

      {/* Preview */}
      {fileUri ? (
        <View className="mt-4">
          <AudioPlayer uri={fileUri} title={fileName} durationSeconds={0} />
        </View>
      ) : null}

      {/* Title Input */}
      {fileUri ? (
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
      ) : null}

      {/* Upload Button */}
      {fileUri ? (
        <View className="mt-4">
          <Button
            title={isUploading ? t('media.uploading') : t('common.save')}
            onPress={handleUpload}
            loading={isUploading}
            icon="cloud-upload-outline"
          />
        </View>
      ) : null}
    </View>
  );
}

export default function AddAudio() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [tabIndex, setTabIndex] = useState(0);

  const handleSuccess = useCallback(() => {
    router.back();
  }, [router]);

  const tabs = [
    { key: 'record', label: t('media.record'), icon: 'mic-outline' },
    { key: 'upload', label: t('media.uploadFile'), icon: 'cloud-upload-outline' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-border">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 mr-2"
            accessibilityLabel={t('common.back')}
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text className="font-sans-bold text-xl text-text-primary flex-1">
            {t('media.addRecording')}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 pt-4 pb-8">
            {/* Segmented Control */}
            <SegmentedControl
              options={tabs}
              selectedIndex={tabIndex}
              onSelect={setTabIndex}
            />

            {/* Tab Content */}
            {tabIndex === 0 ? (
              <View className="pt-4">
                <AudioRecorder
                  relativeId={id}
                  onSuccess={handleSuccess}
                  onCancel={() => router.back()}
                />
              </View>
            ) : (
              <UploadFileTab
                relativeId={id}
                onSuccess={handleSuccess}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
