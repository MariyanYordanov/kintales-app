import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../constants/colors';

const AMBER = '#F59E0B';

export default function HeritageBanner({ onGuardian, onLegacyKey, onDismiss }) {
  const { t } = useTranslation();

  return (
    <View
      className="rounded-2xl p-5 border"
      style={{
        backgroundColor: `${AMBER}08`,
        borderColor: `${AMBER}20`,
      }}
    >
      <View className="flex-row items-start">
        <Ionicons name="heart-outline" size={24} color={AMBER} style={{ marginTop: 2 }} />
        <View className="flex-1 ml-3">
          <Text className="font-sans-semibold text-base text-text-primary leading-5">
            {t('heritage.bannerTitle')}
          </Text>
          <Text className="font-sans text-sm text-text-secondary mt-1">
            {t('heritage.bannerSubtitle')}
          </Text>
        </View>
      </View>

      <View className="flex-row mt-4" style={{ gap: 8 }}>
        <TouchableOpacity
          onPress={onGuardian}
          className="flex-row items-center border rounded-xl px-3 py-2"
          style={{ borderColor: `${AMBER}40` }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('heritage.guardianButton')}
        >
          <Ionicons name="shield-outline" size={16} color={colors.text.primary} />
          <Text className="font-sans-medium text-sm text-text-primary ml-1.5">
            {t('heritage.guardianButton')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onLegacyKey}
          className="flex-row items-center border rounded-xl px-3 py-2"
          style={{ borderColor: `${AMBER}40` }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('heritage.legacyKeyButton')}
        >
          <Ionicons name="key-outline" size={16} color={colors.text.primary} />
          <Text className="font-sans-medium text-sm text-text-primary ml-1.5">
            {t('heritage.legacyKeyButton')}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={onDismiss}
        className="mt-3 self-center"
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        <Text className="font-sans text-sm text-text-muted">
          {t('heritage.remindLater')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
