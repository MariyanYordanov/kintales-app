import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import CommentItem from './CommentItem';
import { useComments } from '../../hooks/useComments';
import { colors } from '../../constants/colors';

const CONTENT_MAX = 2000;

export default function CommentsModal({ storyId, onClose, onCommentsChanged }) {
  const { t } = useTranslation();
  const {
    comments,
    isLoading,
    error,
    isSending,
    addComment,
    removeComment,
  } = useComments(storyId);

  const [text, setText] = useState('');
  const inputRef = useRef(null);

  const canSend = text.trim().length > 0 && !isSending;

  // ── Actions ──

  const handleSend = useCallback(async () => {
    if (!canSend) return;
    const content = text.trim();
    setText('');
    try {
      await addComment(content);
    } catch {
      setText(content);
      Alert.alert(t('common.error'), t('comments.sendError'));
    }
  }, [text, canSend, addComment, t]);

  const handleDelete = useCallback(async (commentId) => {
    try {
      await removeComment(commentId);
    } catch {
      Alert.alert(t('common.error'), t('comments.deleteError'));
    }
  }, [removeComment, t]);

  const handleClose = useCallback(() => {
    if (onCommentsChanged) {
      onCommentsChanged(comments);
    }
    onClose();
  }, [onClose, onCommentsChanged, comments]);

  // ── Render helpers ──

  const renderComment = useCallback(({ item }) => (
    <CommentItem comment={item} onDelete={handleDelete} />
  ), [handleDelete]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View className="flex-1 items-center justify-center py-12">
        <Ionicons name="chatbubble-outline" size={48} color={colors.text.muted} />
        <Text className="font-sans text-base text-text-muted mt-4">
          {t('comments.empty')}
        </Text>
      </View>
    );
  }, [isLoading, t]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <TouchableOpacity
            onPress={handleClose}
            className="p-2"
            accessibilityLabel={t('common.back')}
            accessibilityRole="button"
          >
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text className="font-sans-semibold text-lg text-text-primary">
            {t('comments.title')}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Comments list */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-8">
            <Ionicons name="alert-circle-outline" size={48} color={colors.text.muted} />
            <Text className="font-sans text-base text-text-muted text-center mt-4">
              {t('comments.loadError')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={renderComment}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}

        {/* Sticky comment input */}
        <View className="flex-row items-end px-4 py-3 border-t border-border bg-background">
          <View
            className="flex-1 bg-surface rounded-2xl border border-border px-4 py-2 mr-3"
            style={{ maxHeight: 100 }}
          >
            <TextInput
              ref={inputRef}
              value={text}
              onChangeText={setText}
              placeholder={t('comments.placeholder')}
              placeholderTextColor={colors.text.muted}
              multiline
              maxLength={CONTENT_MAX}
              className="font-sans text-base text-text-primary"
              style={{ maxHeight: 80 }}
              returnKeyType="default"
              testID="comments-input"
            />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!canSend}
            className="w-10 h-10 rounded-full items-center justify-center mb-0.5"
            style={{
              backgroundColor: canSend ? colors.primary.DEFAULT : colors.surface.secondary,
            }}
            accessibilityRole="button"
            accessibilityLabel={t('comments.send')}
            testID="comments-submit-button"
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons
                name="send"
                size={18}
                color={canSend ? '#FFFFFF' : colors.text.muted}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
