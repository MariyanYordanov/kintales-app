import { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert, ActionSheetIOS, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Avatar from '../profile/Avatar';
import AudioPlayer from '../media/AudioPlayer';
import StoryPhotos from './StoryPhotos';
import { formatRelativeTime, separateAttachments } from '../../lib/utils/storyHelpers';
import { colors } from '../../constants/colors';

const MAX_LINES_COLLAPSED = 8;

export default function StoryCard({
  story,
  authorInfo,
  relativeName,
  isAuthor,
  onPressPhoto,
  onDelete,
}) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTextTruncated, setIsTextTruncated] = useState(false);

  const { photos, audio } = useMemo(
    () => separateAttachments(story.attachments),
    [story.attachments],
  );

  const relativeTime = useMemo(
    () => formatRelativeTime(story.createdAt, t),
    [story.createdAt, t],
  );

  const handleTextLayout = useCallback((e) => {
    if (e.nativeEvent.lines && e.nativeEvent.lines.length > MAX_LINES_COLLAPSED) {
      setIsTextTruncated(true);
    }
  }, []);

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(story.content);
    Alert.alert(null, t('stories.textCopied'));
  }, [story.content, t]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      t('stories.deleteStory'),
      t('stories.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: () => onDelete(story.id) },
      ],
    );
  }, [story.id, onDelete, t]);

  const handleMenu = useCallback(() => {
    const options = [t('stories.copyText')];
    if (isAuthor) options.push(t('stories.deleteStory'));
    options.push(t('common.cancel'));

    const cancelIndex = options.length - 1;
    const destructiveIndex = isAuthor ? 1 : -1;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: cancelIndex, destructiveButtonIndex: destructiveIndex },
        (index) => {
          if (index === 0) handleCopy();
          if (index === 1 && isAuthor) handleDelete();
        },
      );
    } else {
      // Android — use Alert
      Alert.alert(
        null,
        null,
        [
          { text: t('stories.copyText'), onPress: handleCopy },
          ...(isAuthor
            ? [{ text: t('stories.deleteStory'), style: 'destructive', onPress: handleDelete }]
            : []),
          { text: t('common.cancel'), style: 'cancel' },
        ],
      );
    }
  }, [isAuthor, t, handleCopy, handleDelete]);

  const commentCount = story.comments?.length || 0;

  return (
    <View className="bg-surface rounded-2xl mb-3 overflow-hidden">
      {/* Header */}
      <View className="flex-row items-center p-4 pb-0">
        <Avatar
          source={authorInfo.avatarUrl ? { uri: authorInfo.avatarUrl } : null}
          name={authorInfo.name}
          size={40}
        />
        <View className="flex-1 ml-3">
          <Text className="font-sans-semibold text-base text-text-primary">
            {authorInfo.name}
          </Text>
          <Text className="font-sans text-sm text-text-muted">
            {relativeTime}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleMenu}
          className="p-2"
          accessibilityRole="button"
          accessibilityLabel={t('common.more')}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.text.muted} />
        </TouchableOpacity>
      </View>

      {/* Relative badge */}
      {relativeName ? (
        <View className="px-4 mt-2">
          <View
            className="flex-row items-center rounded-full px-3 py-1 self-start"
            style={{ backgroundColor: `${colors.primary.DEFAULT}10` }}
          >
            <Ionicons name="people-outline" size={14} color={colors.primary.DEFAULT} />
            <Text className="font-sans-medium text-sm ml-1" style={{ color: colors.primary.DEFAULT }}>
              {t('stories.storyAbout', { name: relativeName })}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Content */}
      <View className="px-4 mt-3">
        <Text
          className="font-sans text-base text-text-primary leading-6"
          numberOfLines={isExpanded ? undefined : MAX_LINES_COLLAPSED}
          onTextLayout={handleTextLayout}
        >
          {story.content}
        </Text>
        {isTextTruncated && !isExpanded ? (
          <TouchableOpacity onPress={() => setIsExpanded(true)}>
            <Text className="font-sans-medium text-sm mt-1" style={{ color: colors.primary.DEFAULT }}>
              {t('common.showMore')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Photos */}
      {photos.length > 0 ? (
        <View className="mt-3">
          <StoryPhotos photos={photos} onPressPhoto={onPressPhoto} />
        </View>
      ) : null}

      {/* Audio players */}
      {audio.length > 0 ? (
        <View className="mt-3">
          {audio.map((a) => (
            <View key={a.id} className="px-4 mb-2">
              <AudioPlayer uri={a.fileUrl} />
            </View>
          ))}
        </View>
      ) : null}

      {/* Footer: comment count */}
      {commentCount > 0 ? (
        <View className="px-4 pt-2 pb-3">
          <View className="flex-row items-center">
            <Ionicons name="chatbubble-outline" size={16} color={colors.text.muted} />
            <Text className="font-sans text-sm text-text-muted ml-1">
              {t('stories.comments', { count: commentCount })}
            </Text>
          </View>
        </View>
      ) : (
        <View className="h-3" />
      )}
    </View>
  );
}
