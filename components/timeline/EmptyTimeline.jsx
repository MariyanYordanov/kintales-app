import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../constants/colors';

export default function EmptyTimeline() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Ionicons name="time-outline" size={48} color={colors.text.muted} />
      <Text className="font-sans-semibold text-lg text-text-primary text-center mt-4">
        {t('timeline.emptyTitle')}
      </Text>
      <Text className="font-sans text-sm text-text-muted text-center mt-2">
        {t('timeline.emptySubtitle')}
      </Text>
    </View>
  );
}
