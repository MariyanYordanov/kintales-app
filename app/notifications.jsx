import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/notifications.service';
import { useNotifications } from '../lib/notifications/notificationContext';
import { getEventIcon, getEventColor } from '../lib/utils/eventHelpers';
import { colors } from '../constants/colors';

const PAGE_SIZE = 20;

function formatTimeAgo(dateStr, t) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return t('notifications.today');
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function isToday(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function NotificationItem({ item, onPress }) {
  const { t } = useTranslation();
  const icon = getEventIcon(item.type);
  const iconColor = getEventColor(item.type);

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      className={`flex-row rounded-2xl p-4 mb-2 ${item.isRead ? 'bg-surface' : 'bg-surface'}`}
      style={item.isRead ? undefined : { borderLeftWidth: 3, borderLeftColor: colors.primary.DEFAULT }}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: `${iconColor}15` }}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className={`font-sans-semibold text-sm text-text-primary flex-1 mr-2 ${item.isRead ? 'opacity-70' : ''}`}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text className="font-sans text-xs text-text-muted">
            {formatTimeAgo(item.createdAt, t)}
          </Text>
        </View>
        {item.body ? (
          <Text
            className={`font-sans text-sm text-text-secondary ${item.isRead ? 'opacity-70' : ''}`}
            numberOfLines={2}
          >
            {item.body}
          </Text>
        ) : null}
      </View>

      {!item.isRead ? (
        <View
          className="w-2.5 h-2.5 rounded-full ml-2 mt-1"
          style={{ backgroundColor: colors.primary.DEFAULT }}
        />
      ) : null}
    </TouchableOpacity>
  );
}

export default function NotificationList() {
  const { t } = useTranslation();
  const router = useRouter();
  const { refreshUnreadCount } = useNotifications();

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const pageRef = useRef(1);

  const fetchNotifications = useCallback(async (page = 1, append = false) => {
    try {
      const { data } = await getNotifications({ page, limit: PAGE_SIZE });
      const items = data.data || [];
      const meta = data.meta || {};

      if (append) {
        setNotifications((prev) => [...prev, ...items]);
      } else {
        setNotifications(items);
      }

      setHasMore(items.length >= PAGE_SIZE && meta.total > page * PAGE_SIZE);
      pageRef.current = page;
    } catch {
      if (!append) setNotifications([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchNotifications(1).finally(() => setIsLoading(false));
      refreshUnreadCount();
    }, [fetchNotifications, refreshUnreadCount]),
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchNotifications(1);
    await refreshUnreadCount();
    setIsRefreshing(false);
  }, [fetchNotifications, refreshUnreadCount]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    await fetchNotifications(pageRef.current + 1, true);
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, fetchNotifications]);

  const handleNotificationPress = useCallback(
    async (item) => {
      if (!item.isRead) {
        // Optimistic update
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
        );

        try {
          await markNotificationRead(item.id);
          refreshUnreadCount();
        } catch {
          // Rollback on error
          setNotifications((prev) =>
            prev.map((n) => (n.id === item.id ? { ...n, isRead: false } : n)),
          );
        }
      }

      if (item.relativeId) {
        router.push(`/tree/${item.relativeId}`);
      }
    },
    [router, refreshUnreadCount],
  );

  const handleMarkAllRead = useCallback(async () => {
    setIsMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      refreshUnreadCount();
    } catch {
      // Silently fail
    } finally {
      setIsMarkingAll(false);
    }
  }, [refreshUnreadCount]);

  const hasUnread = notifications.some((n) => !n.isRead);

  const renderSectionHeader = useCallback(
    (index) => {
      if (index === 0) return null;

      const prevItem = notifications[index - 1];
      const currItem = notifications[index];

      const prevIsToday = isToday(prevItem.createdAt);
      const currIsToday = isToday(currItem.createdAt);

      if (prevIsToday && !currIsToday) {
        return (
          <Text className="font-sans-semibold text-sm text-text-muted mt-3 mb-2 ml-1">
            {t('notifications.earlier')}
          </Text>
        );
      }
      return null;
    },
    [notifications, t],
  );

  const renderItem = useCallback(
    ({ item, index }) => (
      <>
        {index === 0 && isToday(item.createdAt) ? (
          <Text className="font-sans-semibold text-sm text-text-muted mb-2 ml-1">
            {t('notifications.today')}
          </Text>
        ) : null}
        {index === 0 && !isToday(item.createdAt) ? (
          <Text className="font-sans-semibold text-sm text-text-muted mb-2 ml-1">
            {t('notifications.earlier')}
          </Text>
        ) : null}
        {renderSectionHeader(index)}
        <NotificationItem item={item} onPress={handleNotificationPress} />
      </>
    ),
    [t, renderSectionHeader, handleNotificationPress],
  );

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator color={colors.primary.DEFAULT} size="small" />
      </View>
    );
  }, [isLoadingMore]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View className="flex-1 items-center justify-center pt-20">
        <Ionicons name="notifications-off-outline" size={64} color={colors.text.muted} />
        <Text className="font-sans-semibold text-lg text-text-primary mt-4">
          {t('notifications.noNotifications')}
        </Text>
        <Text className="font-sans text-sm text-text-muted text-center mt-1 px-8">
          {t('notifications.noNotificationsDescription')}
        </Text>
      </View>
    );
  }, [isLoading, t]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-3">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text className="font-sans-bold text-xl text-text-primary">
          {t('notifications.title')}
        </Text>
        {hasUnread ? (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            disabled={isMarkingAll}
            accessibilityRole="button"
            accessibilityLabel={t('notifications.markAllRead')}
          >
            {isMarkingAll ? (
              <ActivityIndicator color={colors.primary.DEFAULT} size="small" />
            ) : (
              <Text className="font-sans-medium text-sm text-primary">
                {t('notifications.markAllRead')}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary.DEFAULT} size="large" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary.DEFAULT}
              colors={[colors.primary.DEFAULT]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
