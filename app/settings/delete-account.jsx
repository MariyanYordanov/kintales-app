import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { deleteAccount } from '../../services/account.service';
import TextInput from '../../components/ui/TextInput';
import Button from '../../components/ui/Button';
import { colors } from '../../constants/colors';

const DANGER_RED = '#EF4444';

export default function DeleteAccount() {
  const { t } = useTranslation();
  const router = useRouter();
  const { logout } = useAuth();

  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const isConfirmed = confirmText.trim().toUpperCase() === 'DELETE';

  const handleDelete = useCallback(() => {
    Alert.alert(
      t('deleteAccount.confirmAlert'),
      t('deleteAccount.confirmAlertMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('deleteAccount.deleteButton'),
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteAccount('DELETE_MY_ACCOUNT');
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              await logout();
              router.replace('/(auth)/login');
            } catch (err) {
              console.error('Failed to delete account:', err);
              Alert.alert(t('common.error'), t('deleteAccount.error'));
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  }, [t, logout, router]);

  const warningItems = [
    { icon: 'person-outline', text: t('deleteAccount.warningProfile') },
    { icon: 'book-outline', text: t('deleteAccount.warningStories') },
    { icon: 'chatbubble-outline', text: t('deleteAccount.warningComments') },
    { icon: 'cloud-outline', text: t('deleteAccount.warningFiles') },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={[]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6 pb-8">
          {/* Header */}
          <View className="items-center mb-6">
            <Ionicons name="warning-outline" size={48} color={DANGER_RED} />
            <Text className="font-sans-bold text-xl text-text-primary text-center mt-4">
              {t('deleteAccount.title')}
            </Text>
            <Text className="font-sans text-sm text-text-muted text-center mt-1">
              {t('deleteAccount.subtitle')}
            </Text>
          </View>

          {/* Warning list */}
          <View
            className="rounded-2xl p-5 mb-4"
            style={{ backgroundColor: `${DANGER_RED}08`, borderWidth: 1, borderColor: `${DANGER_RED}20` }}
          >
            <Text className="font-sans-semibold text-sm text-text-primary mb-3">
              {t('deleteAccount.warning')}
            </Text>
            {warningItems.map((item) => (
              <View key={item.icon} className="flex-row items-center mb-2.5">
                <Ionicons name={item.icon} size={18} color={DANGER_RED} />
                <Text className="font-sans text-sm text-text-secondary ml-3">
                  {item.text}
                </Text>
              </View>
            ))}
          </View>

          {/* Keep note */}
          <View className="bg-surface rounded-2xl p-4 mb-6">
            <View className="flex-row items-start">
              <Ionicons name="information-circle-outline" size={20} color={colors.text.muted} style={{ marginTop: 1 }} />
              <Text className="font-sans text-sm text-text-secondary flex-1 ml-2">
                {t('deleteAccount.keepNote')}
              </Text>
            </View>
          </View>

          {/* Confirm input */}
          <TextInput
            label={t('deleteAccount.confirmLabel')}
            value={confirmText}
            onChangeText={setConfirmText}
            placeholder={t('deleteAccount.confirmPlaceholder')}
            autoCapitalize="characters"
            autoCorrect={false}
            icon="lock-closed-outline"
            testID="delete-confirm-input"
          />

          {/* Delete button */}
          <View className="mt-4">
            <Button
              title={t('deleteAccount.deleteButton')}
              onPress={handleDelete}
              loading={isDeleting}
              disabled={!isConfirmed}
              icon="trash-outline"
              variant="danger"
              testID="delete-confirm-button"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
