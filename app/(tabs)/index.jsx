import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth/authContext';
import { getUserTrees, getTreeRelatives } from '../../services/tree.service';
import { getTreeEvents } from '../../services/events.service';
import {
  groupEventsByPeriod,
  buildRelativesMap,
  pickStoryPromptRelative,
} from '../../lib/utils/eventHelpers';
import EventSection from '../../components/dashboard/EventSection';
import StoryPromptBanner from '../../components/dashboard/StoryPromptBanner';
import HeritageBanner from '../../components/dashboard/HeritageBanner';
import EmptyDashboard from '../../components/dashboard/EmptyDashboard';
import Button from '../../components/ui/Button';
import { SkeletonEventCard } from '../../components/ui/Skeleton';
import { isDismissed, dismiss } from '../../lib/utils/heritageBannerStorage';
import { colors } from '../../constants/colors';

export default function Dashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [relatives, setRelatives] = useState([]);
  const [hasTree, setHasTree] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showHeritageBanner, setShowHeritageBanner] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);

      const { data: treesData } = await getUserTrees();
      const trees = treesData.data || [];

      if (trees.length === 0) {
        setHasTree(false);
        setEvents([]);
        setRelatives([]);
        return;
      }

      setHasTree(true);
      const tree = trees[0];

      const [eventsRes, relativesRes] = await Promise.all([
        getTreeEvents(tree.id),
        getTreeRelatives(tree.id),
      ]);

      setEvents(eventsRes.data.data || []);
      setRelatives(relativesRes.data.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
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

  // Check heritage banner visibility when relatives change
  useEffect(() => {
    if (relatives.length === 0) {
      setShowHeritageBanner(false);
      return;
    }
    const livingCount = relatives.filter((r) => r.status === 'ALIVE').length;
    if (livingCount > 1) {
      setShowHeritageBanner(false);
      return;
    }
    isDismissed()
      .then((dismissed) => setShowHeritageBanner(!dismissed))
      .catch(() => setShowHeritageBanner(false));
  }, [relatives]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }, [loadData]);

  // Derived data (memoized)
  const relativesMap = useMemo(
    () => buildRelativesMap(relatives),
    [relatives],
  );

  const { today, thisWeek, thisMonth } = useMemo(
    () => groupEventsByPeriod(events),
    [events],
  );

  const storyRelative = useMemo(
    () => pickStoryPromptRelative(relatives),
    [relatives],
  );

  const hasAnyEvents = today.length > 0 || thisWeek.length > 0 || thisMonth.length > 0;

  const handleEventPress = useCallback((relativeId) => {
    router.push(`/tree/${relativeId}`);
  }, [router]);

  const handleCreateTree = useCallback(() => {
    router.push('/(tabs)/tree');
  }, [router]);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="px-6 pt-6 pb-2">
          <View className="bg-border rounded-lg w-3/5 h-9 mb-2" style={{ opacity: 0.3 }} />
          <View className="bg-border rounded-lg w-2/5 h-4 mb-6" style={{ opacity: 0.2 }} />
        </View>
        <View className="px-6">
          <SkeletonEventCard />
          <SkeletonEventCard />
          <SkeletonEventCard />
          <SkeletonEventCard />
          <SkeletonEventCard />
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-8" edges={['top']}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.text.muted} />
        <Text className="font-sans-medium text-base text-text-secondary text-center mt-4 mb-6">
          {t('common.somethingWentWrong')}
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

  // No tree state
  if (!hasTree) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <EmptyDashboard variant="no-tree" onCreateTree={handleCreateTree} />
      </SafeAreaView>
    );
  }

  const firstName = user?.fullName?.split(' ')[0] || '';

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.DEFAULT}
            colors={[colors.primary.DEFAULT]}
          />
        }
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-2">
          <Text className="font-sans-bold text-3xl text-text-primary">
            {t('dashboard.greeting', { name: firstName })}
          </Text>
          <Text className="font-sans text-sm text-text-muted mt-1">
            {t('dashboard.subtitle')}
          </Text>
        </View>

        {/* Heritage Banner */}
        {showHeritageBanner ? (
          <View className="px-6 pt-4">
            <HeritageBanner
              onGuardian={() => router.push('/settings/guardians')}
              onLegacyKey={() => router.push('/settings/legacy-key')}
              onDismiss={() => {
                dismiss();
                setShowHeritageBanner(false);
              }}
            />
          </View>
        ) : null}

        {/* Story Prompt Banner */}
        {storyRelative ? (
          <View className="px-6 pt-4" testID="dashboard-story-prompt">
            <StoryPromptBanner
              relative={storyRelative}
              onPress={handleEventPress}
            />
          </View>
        ) : null}

        {/* Event Sections */}
        {hasAnyEvents ? (
          <View className="px-6 pt-4 pb-8">
            <EventSection
              title={t('dashboard.today')}
              events={today}
              relativesMap={relativesMap}
              onEventPress={handleEventPress}
            />
            <EventSection
              title={t('dashboard.thisWeek')}
              events={thisWeek}
              relativesMap={relativesMap}
              onEventPress={handleEventPress}
            />
            <EventSection
              title={t('dashboard.thisMonth')}
              events={thisMonth}
              relativesMap={relativesMap}
              onEventPress={handleEventPress}
            />
          </View>
        ) : (
          <EmptyDashboard variant="no-events" />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
