import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth/authContext';
import { getUserTrees, getTreeRelatives } from '../../services/tree.service';
import { getTreeStories, deleteStory } from '../../services/stories.service';
import {
  getAuthorInfo,
  getRelativeName,
  buildRelativesMap,
} from '../../lib/utils/storyHelpers';
import StoryCard from '../../components/stories/StoryCard';
import CreateStoryForm from '../../components/stories/CreateStoryForm';
import EmptyFeed from '../../components/stories/EmptyFeed';
import PhotoLightbox from '../../components/media/PhotoLightbox';
import Button from '../../components/ui/Button';
import { colors } from '../../constants/colors';

const PAGE_SIZE = 20;

export default function Feed() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [stories, setStories] = useState([]);
  const [relatives, setRelatives] = useState([]);
  const [treeId, setTreeId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [lightbox, setLightbox] = useState({ visible: false, photos: [], index: 0 });

  // ── Data loading ──

  const loadData = useCallback(async () => {
    try {
      setError(null);

      const { data: treesData } = await getUserTrees();
      const trees = treesData.data || [];

      if (trees.length === 0) {
        setTreeId(null);
        setStories([]);
        setRelatives([]);
        return;
      }

      const tree = trees[0];
      setTreeId(tree.id);

      const [storiesRes, relativesRes] = await Promise.all([
        getTreeStories(tree.id, 1, PAGE_SIZE),
        getTreeRelatives(tree.id),
      ]);

      const storiesData = storiesRes.data.data || [];
      const meta = storiesRes.data.meta || {};

      setStories(storiesData);
      setRelatives(relativesRes.data.data || []);
      setCurrentPage(1);
      setHasMore(1 < (meta.totalPages || 1));
    } catch (err) {
      console.error('Failed to load feed data:', err);
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
      const res = await getTreeStories(treeId, 1, PAGE_SIZE);
      const data = res.data.data || [];
      const meta = res.data.meta || {};
      setStories(data);
      setCurrentPage(1);
      setHasMore(1 < (meta.totalPages || 1));
    } catch (err) {
      console.error('Failed to refresh feed:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [treeId]);

  // ── Infinite scroll ──

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !treeId) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const res = await getTreeStories(treeId, nextPage, PAGE_SIZE);
      const data = res.data.data || [];
      const meta = res.data.meta || {};

      setStories((prev) => [...prev, ...data]);
      setCurrentPage(nextPage);
      setHasMore(nextPage < (meta.totalPages || 1));
    } catch (err) {
      console.error('Failed to load more stories:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, treeId, currentPage]);

  // ── Derived data ──

  const relativesMap = useMemo(
    () => buildRelativesMap(relatives),
    [relatives],
  );

  // ── Actions ──

  const handleStoryCreated = useCallback((newStory) => {
    setStories((prev) => [newStory, ...prev]);
    setCreateModalVisible(false);
  }, []);

  const handleDeleteStory = useCallback(async (storyId) => {
    try {
      await deleteStory(storyId);
      setStories((prev) => prev.filter((s) => s.id !== storyId));
      Alert.alert(null, t('stories.deleteSuccess'));
    } catch (err) {
      console.error('Failed to delete story:', err);
      Alert.alert(t('common.error'), t('stories.deleteError'));
    }
  }, [t]);

  const handleOpenLightbox = useCallback((story, photoIndex) => {
    const photos = (story.attachments || [])
      .filter((a) => a.fileType === 'photo')
      .map((a) => ({ id: a.id, fileUrl: a.fileUrl, caption: a.caption }));

    if (photos.length > 0) {
      setLightbox({ visible: true, photos, index: photoIndex });
    }
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setLightbox({ visible: false, photos: [], index: 0 });
  }, []);

  const handleOpenCreate = useCallback(() => {
    setCreateModalVisible(true);
  }, []);

  const handleCloseCreate = useCallback(() => {
    setCreateModalVisible(false);
  }, []);

  // ── Render helpers ──

  const renderStory = useCallback(({ item }) => {
    const authorInfo = getAuthorInfo(item.authorId, user, t);
    const relName = getRelativeName(item.relativeId, relativesMap);

    return (
      <StoryCard
        story={item}
        authorInfo={authorInfo}
        relativeName={relName}
        isAuthor={item.authorId === user?.id}
        onPressPhoto={(index) => handleOpenLightbox(item, index)}
        onDelete={handleDeleteStory}
      />
    );
  }, [user, t, relativesMap, handleOpenLightbox, handleDeleteStory]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
      </View>
    );
  }, [isLoadingMore]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return <EmptyFeed onCreateStory={treeId ? handleOpenCreate : null} />;
  }, [isLoading, treeId, handleOpenCreate]);

  // ── Loading state ──

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </SafeAreaView>
    );
  }

  // ── Error state ──

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

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="px-6 pt-6 pb-2">
        <Text className="font-sans-bold text-3xl text-text-primary">
          {t('stories.title')}
        </Text>
      </View>

      {/* Stories list */}
      <FlatList
        data={stories}
        keyExtractor={(item) => item.id}
        renderItem={renderStory}
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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />

      {/* FAB — Create Story */}
      {treeId ? (
        <TouchableOpacity
          onPress={handleOpenCreate}
          className="absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center"
          style={{
            backgroundColor: colors.primary.DEFAULT,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 8,
          }}
          accessibilityRole="button"
          accessibilityLabel={t('stories.newStory')}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      ) : null}

      {/* Photo Lightbox */}
      <PhotoLightbox
        photos={lightbox.photos}
        initialIndex={lightbox.index}
        visible={lightbox.visible}
        onClose={handleCloseLightbox}
      />

      {/* Create Story Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseCreate}
      >
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
          {/* Modal header */}
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
            <TouchableOpacity
              onPress={handleCloseCreate}
              className="p-2"
              accessibilityLabel={t('common.cancel')}
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text className="font-sans-semibold text-lg text-text-primary">
              {t('stories.newStory')}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <CreateStoryForm
            treeId={treeId}
            relatives={relatives}
            onSuccess={handleStoryCreated}
            onCancel={handleCloseCreate}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
