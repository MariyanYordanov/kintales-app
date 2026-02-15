import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { redeemLegacyKey } from '../../services/legacy.service';
import TextInput from '../../components/ui/TextInput';
import Button from '../../components/ui/Button';
import { colors } from '../../constants/colors';

export default function Legacy() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();

  const [keyCode, setKeyCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleRedeem = useCallback(async () => {
    const trimmed = keyCode.trim().toUpperCase();
    if (!trimmed) return;

    setIsRedeeming(true);
    try {
      const { data } = await redeemLegacyKey(trimmed);
      const treeName = data.data?.tree?.name || '';

      Alert.alert(
        t('legacy.redeemSuccess'),
        t('legacy.redeemSuccessMessage', { treeName }),
        [
          {
            text: t('common.done'),
            onPress: () => router.replace('/(tabs)'),
          },
        ],
      );
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        Alert.alert(t('common.error'), t('legacy.redeemNotFound'));
      } else if (status === 409) {
        Alert.alert(t('common.error'), t('legacy.redeemAlreadyMember'));
      } else if (status === 403) {
        Alert.alert(t('common.error'), t('legacy.redeemEmailMismatch'));
      } else {
        Alert.alert(t('common.error'), t('errors.unknown'));
      }
    } finally {
      setIsRedeeming(false);
    }
  }, [keyCode, t, router]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-8 items-center">
            <Ionicons name="key-outline" size={48} color={colors.primary.DEFAULT} />

            <Text className="font-sans-bold text-2xl text-text-primary text-center mt-6">
              {t('legacy.redeemTitle')}
            </Text>

            <Text className="font-sans text-base text-text-secondary text-center mt-2 mb-8">
              {t('legacy.redeemSubtitle')}
            </Text>

            <View className="w-full">
              <TextInput
                label={t('legacy.keyCode')}
                value={keyCode}
                onChangeText={(v) => setKeyCode(v.toUpperCase())}
                placeholder={t('legacy.redeemPlaceholder')}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={21}
                icon="key-outline"
              />
            </View>

            <View className="w-full mt-2">
              <Button
                title={t('legacy.redeemButton')}
                onPress={handleRedeem}
                loading={isRedeeming}
                icon="checkmark-outline"
                disabled={!keyCode.trim()}
              />
            </View>

            {!user ? (
              <View className="mt-6">
                <Link href="/(auth)/register" asChild>
                  <Text className="font-sans-medium text-sm text-primary text-center">
                    {t('auth.noAccount')}{' '}
                    <Text className="font-sans-semibold">{t('auth.register')}</Text>
                  </Text>
                </Link>
              </View>
            ) : null}

            <View className="mt-8">
              <Link href="/(auth)/login" asChild>
                <Text className="font-sans text-sm text-text-muted text-center">
                  {t('auth.backToLogin')}
                </Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
