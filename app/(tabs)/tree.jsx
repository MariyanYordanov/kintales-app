import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { FamilyTree } from '@kintales/tree-view';
import { getUserTrees, getTreeRelatives, getTreeRelationships } from '../../services/tree.service';
import { mapRelativesToPeople, mapRelationshipsToTreeFormat } from '../../lib/utils/treeDataMapper';
import { violetTreeTheme } from '../../constants/treeTheme';
import { colors } from '../../constants/colors';
import Button from '../../components/ui/Button';
import RelativesList from '../../components/tree/RelativesList';

export default function Tree() {
  const { t } = useTranslation();
  const router = useRouter();
  const [treeId, setTreeId] = useState(null);
  const [relatives, setRelatives] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('tree');

  const loadData = useCallback(async () => {
    try {
      const { data: treesData } = await getUserTrees();
      const trees = treesData.data || [];

      if (trees.length === 0) {
        setIsLoading(false);
        return;
      }

      const tree = trees[0];
      setTreeId(tree.id);

      const [relativesRes, relationshipsRes] = await Promise.all([
        getTreeRelatives(tree.id),
        getTreeRelationships(tree.id),
      ]);

      setRelatives(relativesRes.data.data || []);
      setRelationships(relationshipsRes.data.data || []);
    } catch (error) {
      console.error('Failed to load tree data:', error);
      Alert.alert(t('common.error'), t('tree.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }, [loadData]);

  const navigateToAddRelative = useCallback(() => {
    if (treeId) {
      router.push({ pathname: '/tree/add-relative', params: { treeId } });
    }
  }, [treeId, router]);

  const handlePersonTap = useCallback((person) => {
    Alert.alert(person.name, t('tree.personTapPlaceholder'));
  }, [t]);

  const handleListItemPress = useCallback(() => {
    // TODO Phase 2.3: navigate to person/[id]
  }, []);

  const treePeople = useMemo(
    () => mapRelativesToPeople(relatives),
    [relatives],
  );

  const treeRelationships = useMemo(
    () => mapRelationshipsToTreeFormat(relationships),
    [relationships],
  );

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </SafeAreaView>
    );
  }

  // Empty state
  if (relatives.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-6">
            <Ionicons name="people" size={48} color={colors.primary.DEFAULT} />
          </View>

          <Text className="font-sans-bold text-2xl text-text-primary text-center mb-3">
            {t('tree.emptyTitle')}
          </Text>
          <Text className="font-sans text-base text-text-secondary text-center mb-8 leading-6">
            {t('tree.emptySubtitle')}
          </Text>

          <View style={{ width: '100%' }}>
            <Button
              title={t('tree.addFirstRelative')}
              onPress={navigateToAddRelative}
              icon="person-add-outline"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Has relatives
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="px-6 pt-6 pb-3">
        <Text className="font-sans-bold text-3xl text-text-primary">
          {t('tree.title')}
        </Text>
        <Text className="font-sans text-sm text-text-muted mt-1">
          {t('tree.relativesCount', { count: relatives.length })}
        </Text>
      </View>

      {/* View mode toggle */}
      <View className="mx-6 mb-3">
        <View className="flex-row bg-surface-secondary rounded-xl p-1">
          <TouchableOpacity
            onPress={() => setViewMode('tree')}
            className={`flex-1 py-2 rounded-lg items-center ${viewMode === 'tree' ? 'bg-primary' : ''}`}
            accessibilityRole="button"
            accessibilityState={{ selected: viewMode === 'tree' }}
            accessibilityLabel={t('tree.viewTree')}
          >
            <Text
              className={`text-sm ${viewMode === 'tree' ? 'text-white font-sans-semibold' : 'text-text-secondary font-sans-medium'}`}
            >
              {t('tree.viewTree')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            className={`flex-1 py-2 rounded-lg items-center ${viewMode === 'list' ? 'bg-primary' : ''}`}
            accessibilityRole="button"
            accessibilityState={{ selected: viewMode === 'list' }}
            accessibilityLabel={t('tree.viewList')}
          >
            <Text
              className={`text-sm ${viewMode === 'list' ? 'text-white font-sans-semibold' : 'text-text-secondary font-sans-medium'}`}
            >
              {t('tree.viewList')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content — keep FamilyTree mounted to preserve pan/zoom state */}
      <View style={{ flex: 1, display: viewMode === 'tree' ? 'flex' : 'none' }}>
        <FamilyTree
          people={treePeople}
          relationships={treeRelationships}
          theme="custom"
          customTheme={violetTreeTheme}
          onPersonTap={handlePersonTap}
          photoShape="circle"
          deceasedStyle="none"
          showPhotos
          showDates
          enablePan
          enableZoom
          minZoom={0.3}
          maxZoom={3.0}
        />
        {treePeople.length === 1 && treeRelationships.length === 0 ? (
          <View className="absolute bottom-20 left-0 right-0 items-center px-6">
            <View className="bg-surface px-4 py-3 rounded-2xl" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
              <Text className="font-sans text-sm text-text-secondary text-center">
                {t('tree.singlePersonHint')}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
      {viewMode === 'list' ? (
        <RelativesList
          relatives={relatives}
          onPressItem={handleListItemPress}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
      ) : null}

      {/* FAB */}
      <TouchableOpacity
        onPress={navigateToAddRelative}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary items-center justify-center"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 6,
        }}
        accessibilityRole="button"
        accessibilityLabel={t('tree.addRelative')}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
