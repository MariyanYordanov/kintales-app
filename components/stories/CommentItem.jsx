import { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../profile/Avatar';
import { formatRelativeTime, getAuthorInfo } from '../../lib/utils/storyHelpers';
import { useAuth } from '../../lib/auth/authContext';
import { colors } from '../../constants/colors';

export default function CommentItem({ comment, onDelete }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAuthor = comment.authorId === user?.id;

  const authorInfo = useMemo(
    () => getAuthorInfo(comment.authorId, user, t),
    [comment.authorId, user, t],
  );

  const relativeTime = useMemo(
    () => formatRelativeTime(comment.createdAt, t),
    [comment.createdAt, t],
  );

  const handleDelete = useCallback(() => {
    Alert.alert(
      t('comments.deleteComment'),
      t('comments.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => onDelete(comment.id),
        },
      ],
    );
  }, [comment.id, onDelete, t]);

  return (
    <View className="flex-row px-4 py-3">
      <Avatar
        source={authorInfo.avatarUrl ? { uri: authorInfo.avatarUrl } : null}
        name={authorInfo.name}
        size={32}
      />
      <View className="flex-1 ml-3">
        <View className="flex-row items-center">
          <Text className="font-sans-semibold text-sm text-text-primary">
            {authorInfo.name}
          </Text>
          <Text className="font-sans text-xs text-text-muted ml-2">
            {relativeTime}
          </Text>
        </View>
        <Text className="font-sans text-sm text-text-primary mt-1 leading-5">
          {comment.content}
        </Text>
      </View>
      {isAuthor ? (
        <TouchableOpacity
          onPress={handleDelete}
          className="p-1 self-start"
          accessibilityRole="button"
          accessibilityLabel={t('comments.deleteComment')}
        >
          <Ionicons name="trash-outline" size={16} color={colors.text.muted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
