import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../constants/colors';

const PRIVACY_URL = 'https://kintales.net/privacy';
const TERMS_URL = 'https://kintales.net/terms';

export default function Privacy() {
  const { t } = useTranslation();

  const handleOpenLink = (url) => {
    Linking.openURL(url).catch(() => {
      // Silently fail if URL cannot be opened
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={[]}>
      <View className="px-6 pt-6">
        {/* External links */}
        <TouchableOpacity
          onPress={() => handleOpenLink(PRIVACY_URL)}
          className="flex-row items-center bg-surface rounded-2xl p-4 mb-3"
          activeOpacity={0.7}
          accessibilityRole="link"
          accessibilityLabel={t('privacy.privacyPolicy')}
        >
          <Ionicons name="document-text-outline" size={22} color={colors.text.primary} />
          <Text className="font-sans-medium text-base text-text-primary flex-1 ml-3">
            {t('privacy.privacyPolicy')}
          </Text>
          <Ionicons name="open-outline" size={18} color={colors.text.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleOpenLink(TERMS_URL)}
          className="flex-row items-center bg-surface rounded-2xl p-4 mb-6"
          activeOpacity={0.7}
          accessibilityRole="link"
          accessibilityLabel={t('privacy.termsOfService')}
        >
          <Ionicons name="shield-checkmark-outline" size={22} color={colors.text.primary} />
          <Text className="font-sans-medium text-base text-text-primary flex-1 ml-3">
            {t('privacy.termsOfService')}
          </Text>
          <Ionicons name="open-outline" size={18} color={colors.text.muted} />
        </TouchableOpacity>

        {/* Separator */}
        <View className="h-px bg-border mb-6" />

        {/* Anonymization info */}
        <View className="bg-surface rounded-2xl p-5">
          <View className="flex-row items-center mb-3">
            <Ionicons name="eye-off-outline" size={22} color={colors.text.primary} />
            <Text className="font-sans-semibold text-base text-text-primary ml-3">
              {t('privacy.anonymize')}
            </Text>
          </View>
          <Text className="font-sans text-sm text-text-secondary leading-5">
            {t('privacy.anonymizeInfo')}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
