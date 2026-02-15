import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { getUserTrees, getTreeRelatives, getTreeRelationships } from '../../services/tree.service';
import { getTreeStories } from '../../services/stories.service';
import {
  buildTimeline,
  filterByYearRange,
  filterByPerson,
  sortEntries,
  computeYearRange,
  computeSepiaOpacity,
} from '../../lib/utils/timelineHelpers';
import TimelineEntry from '../../components/timeline/TimelineEntry';
import EmptyTimeline from '../../components/timeline/EmptyTimeline';
import Button from '../../components/ui/Button';
import { SkeletonTimelineEntry } from '../../components/ui/Skeleton';
import { colors } from '../../constants/colors';

const STORIES_LIMIT = 100;

export default function Timeline() {
  const { t } = useTranslation();

  // ── Data state ──
  const [relatives, setRelatives] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [stories, setStories] = useState([]);
  const [treeId, setTreeId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // ── Filter state ──
  const [fromYearText, setFromYearText] = useState('');
  const [toYearText, setToYearText] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  const [sortDirection, setSortDirection] = useState('desc');

  // ── Load data ──

  const loadData = useCallback(async () => {
    try {
      setError(null);

      const { data: treesData } = await getUserTrees();
      const trees = treesData.data || [];

      if (trees.length === 0) {
        setTreeId(null);
        setRelatives([]);
        setRelationships([]);
        setStories([]);
        return;
      }

      const tree = trees[0];
      setTreeId(tree.id);

      const [relativesRes, relationshipsRes, storiesRes] = await Promise.all([
        getTreeRelatives(tree.id),
        getTreeRelationships(tree.id),
        getTreeStories(tree.id, 1, STORIES_LIMIT),
      ]);

      setRelatives(relativesRes.data.data || []);
      setRelationships(relationshipsRes.data.data || []);
      setStories(storiesRes.data.data || []);
    } catch (err) {
      console.error('Failed to load timeline data:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  // ── Pull-to-refresh ──

  const handleRefresh = useCallback(async () => {
    if (!treeId) return;
    setIsRefreshing(true);
    try {
      const [relativesRes, relationshipsRes, storiesRes] = await Promise.all([
        getTreeRelatives(treeId),
        getTreeRelationships(treeId),
        getTreeStories(treeId, 1, STORIES_LIMIT),
      ]);
      setRelatives(relativesRes.data.data || []);
      setRelationships(relationshipsRes.data.data || []);
      setStories(storiesRes.data.data || []);
    } catch (err) {
      console.error('Failed to refresh timeline:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [treeId]);

  // ── Derived data ──

  const allEntries = useMemo(
    () => buildTimeline(relatives, relationships, stories),
    [relatives, relationships, stories],
  );

  const yearRange = useMemo(
    () => computeYearRange(allEntries),
    [allEntries],
  );

  const fromYear = fromYearText ? parseInt(fromYearText, 10) : null;
  const toYear = toYearText ? parseInt(toYearText, 10) : null;

  const filteredEntries = useMemo(() => {
    const validFrom = fromYear && !Number.isNaN(fromYear) ? fromYear : null;
    const validTo = toYear && !Number.isNaN(toYear) ? toYear : null;

    let result = filterByYearRange(allEntries, validFrom, validTo);
    result = filterByPerson(result, selectedPersonId);
    result = sortEntries(result, sortDirection);
    return result;
  }, [allEntries, fromYear, toYear, selectedPersonId, sortDirection]);

  // ── Handlers ──

  const handleToggleSort = useCallback(() => {
    setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  }, []);

  const handleSelectPerson = useCallback((personId) => {
    setSelectedPersonId((prev) => (prev === personId ? null : personId));
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedPersonId(null);
  }, []);

  // ── Render helpers ──

  const renderEntry = useCallback(({ item }) => {
    const opacity = computeSepiaOpacity(
      item.date.year,
      yearRange.minYear,
      yearRange.maxYear,
    );
    return <TimelineEntry entry={item} sepiaOpacity={opacity} />;
  }, [yearRange]);

  const keyExtractor = useCallback((item) => {
    switch (item.type) {
      case 'birth':
        return `birth-${item.personId}`;
      case 'death':
        return `death-${item.personId}`;
      case 'marriage':
        return `marriage-${item.personAId}-${item.personBId}`;
      case 'story':
        return `story-${item.storyId}`;
      default:
        return `${item.type}-${item.sortKey}`;
    }
  }, []);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return <EmptyTimeline />;
  }, [isLoading]);

  // ── Loading state ──

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="px-6 pt-6 pb-2">
          <View className="bg-border rounded-lg w-2/5 h-9 mb-4" style={{ opacity: 0.3 }} />
        </View>
        <View className="px-6">
          <SkeletonTimelineEntry />
          <SkeletonTimelineEntry />
          <SkeletonTimelineEntry />
          <SkeletonTimelineEntry />
          <SkeletonTimelineEntry />
        </View>
      </SafeAreaView>
    );
  }

  // ── Error state ──

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-8" edges={['top']}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.text.muted} />
        <Text className="font-sans-medium text-base text-text-secondary text-center mt-4 mb-6">
          {t('timeline.loadError')}
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

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="px-6 pt-6 pb-2">
        <Text className="font-sans-bold text-3xl text-text-primary">
          {t('timeline.title')}
        </Text>
      </View>

      {/* Filters */}
      {allEntries.length > 0 ? (
        <View className="px-4 pb-2">
          {/* Row 1: Year range + Sort */}
          <View className="flex-row items-center mb-2">
            <TextInput
              className="bg-surface border border-border rounded-xl px-3 py-2 font-sans text-sm text-text-primary"
              style={{ width: 80 }}
              placeholder={t('timeline.fromYear')}
              placeholderTextColor={colors.text.muted}
              value={fromYearText}
              onChangeText={setFromYearText}
              keyboardType="number-pad"
              maxLength={4}
              accessibilityLabel={t('timeline.fromYear')}
            />
            <Text className="font-sans text-text-muted mx-2">—</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-3 py-2 font-sans text-sm text-text-primary"
              style={{ width: 80 }}
              placeholder={t('timeline.toYear')}
              placeholderTextColor={colors.text.muted}
              value={toYearText}
              onChangeText={setToYearText}
              keyboardType="number-pad"
              maxLength={4}
              accessibilityLabel={t('timeline.toYear')}
            />
            <View className="flex-1" />
            <TouchableOpacity
              onPress={handleToggleSort}
              className="flex-row items-center bg-surface border border-border rounded-xl px-3 py-2"
              accessibilityRole="button"
              accessibilityLabel={sortDirection === 'desc' ? t('timeline.sortNewest') : t('timeline.sortOldest')}
            >
              <Ionicons
                name={sortDirection === 'desc' ? 'arrow-down-outline' : 'arrow-up-outline'}
                size={16}
                color={colors.text.primary}
              />
              <Text className="font-sans-medium text-sm text-text-primary ml-1">
                {sortDirection === 'desc' ? t('timeline.sortNewest') : t('timeline.sortOldest')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Row 2: Person filter chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {/* "All" chip */}
            <TouchableOpacity
              onPress={handleSelectAll}
              className="mr-2 rounded-full px-4 py-1.5"
              style={{
                backgroundColor: selectedPersonId === null
                  ? colors.primary.DEFAULT
                  : colors.surface.secondary,
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedPersonId === null }}
            >
              <Text
                className="font-sans-medium text-sm"
                style={{
                  color: selectedPersonId === null ? '#FFFFFF' : colors.text.secondary,
                }}
              >
                {t('timeline.filterAll')}
              </Text>
            </TouchableOpacity>

            {/* Person chips */}
            {relatives.map((r) => {
              const isSelected = selectedPersonId === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => handleSelectPerson(r.id)}
                  className="mr-2 rounded-full px-4 py-1.5"
                  style={{
                    backgroundColor: isSelected
                      ? colors.primary.DEFAULT
                      : colors.surface.secondary,
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    className="font-sans-medium text-sm"
                    style={{
                      color: isSelected ? '#FFFFFF' : colors.text.secondary,
                    }}
                    numberOfLines={1}
                  >
                    {r.fullName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {/* Timeline list */}
      <FlatList
        data={filteredEntries}
        keyExtractor={keyExtractor}
        renderItem={renderEntry}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.DEFAULT}
            colors={[colors.primary.DEFAULT]}
          />
        }
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
}
