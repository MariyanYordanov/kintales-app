import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getUserTrees } from '../../services/tree.service';
import { getAccessToken } from '../../lib/auth/tokenStorage';
import Button from '../../components/ui/Button';
import { colors } from '../../constants/colors';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function ExportData() {
  const { t } = useTranslation();

  const [treeId, setTreeId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const { data: treesData } = await getUserTrees();
      const trees = treesData.data || [];

      if (trees.length > 0) {
        setTreeId(trees[0].id);
      } else {
        setTreeId(null);
      }
    } catch (err) {
      console.error('Failed to load trees for export:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadData();
    }, [loadData]),
  );

  const handleDownload = useCallback(async () => {
    if (!treeId) return;

    setIsDownloading(true);
    try {
      const token = await getAccessToken();
      const downloadUrl = `${API_URL}/api/trees/${treeId}/export`;
      const fileUri = `${FileSystem.cacheDirectory}kintales-export.zip`;

      const result = await FileSystem.downloadAsync(downloadUrl, fileUri, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (result.status !== 200) {
        throw new Error(`Download failed with status ${result.status}`);
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, {
          mimeType: 'application/zip',
          dialogTitle: t('export.downloadSuccess'),
        });
      } else {
        Alert.alert(t('common.done'), t('export.downloadSuccess'));
      }
    } catch (err) {
      console.error('Export failed:', err);
      Alert.alert(t('common.error'), t('export.downloadError'));
    } finally {
      setIsDownloading(false);
    }
  }, [treeId, t]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={[]}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-8" edges={[]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.text.muted} />
        <Text className="font-sans-medium text-base text-text-secondary text-center mt-4 mb-6">
          {t('errors.unknown')}
        </Text>
        <Button
          title={t('common.retry')}
          onPress={() => { setIsLoading(true); loadData(); }}
          variant="outline"
          icon="refresh-outline"
        />
      </SafeAreaView>
    );
  }

  if (!treeId) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-8" edges={[]}>
        <Ionicons name="cloud-download-outline" size={48} color={colors.text.muted} />
        <Text className="font-sans-semibold text-lg text-text-primary text-center mt-4">
          {t('export.noTree')}
        </Text>
      </SafeAreaView>
    );
  }

  const items = [
    { icon: 'images-outline', label: t('export.includesPhotos') },
    { icon: 'mic-outline', label: t('export.includesAudio') },
    { icon: 'document-text-outline', label: t('export.includesStories') },
    { icon: 'git-network-outline', label: t('export.includesTree') },
    { icon: 'person-outline', label: t('export.includesBios') },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={[]}>
      <View className="flex-1 px-6 pt-6">
        <View className="items-center mb-6">
          <Ionicons name="cloud-download-outline" size={48} color={colors.primary.DEFAULT} />
          <Text className="font-sans text-sm text-text-muted text-center mt-4 px-4">
            {t('export.subtitle')}
          </Text>
        </View>

        <View className="bg-surface rounded-2xl p-5 mb-6">
          <Text className="font-sans-semibold text-base text-text-primary mb-3">
            {t('export.includes')}
          </Text>
          {items.map((item) => (
            <View key={item.icon} className="flex-row items-center mb-2.5">
              <Ionicons name={item.icon} size={18} color={colors.text.secondary} />
              <Text className="font-sans text-sm text-text-secondary ml-3">
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        <Button
          title={isDownloading ? t('export.downloading') : t('export.downloadAll')}
          onPress={handleDownload}
          loading={isDownloading}
          icon="download-outline"
        />
      </View>
    </SafeAreaView>
  );
}
