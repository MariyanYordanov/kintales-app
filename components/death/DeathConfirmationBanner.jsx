import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { formatPartialDate } from '../../lib/utils/dateFormatter';
import Button from '../ui/Button';
import { colors } from '../../constants/colors';

export default function DeathConfirmationBanner({
  deathRecord,
  personName,
  onConfirm,
  onDispute,
  isLoading,
}) {
  const { t } = useTranslation();

  if (!deathRecord?.deathYear) return null;

  const formattedDate = formatPartialDate(
    deathRecord.deathYear,
    deathRecord.deathMonth,
    deathRecord.deathDay,
    t,
  );

  return (
    <View
      className="bg-amber-50 border border-amber-200 rounded-2xl p-4"
      accessibilityRole="alert"
    >
      <View className="flex-row items-start mb-3">
        <View className="mt-0.5 mr-3">
          <Ionicons name="flower-outline" size={22} color={colors.secondary.DEFAULT} />
        </View>
        <Text className="font-sans text-base text-text-primary leading-6 flex-1">
          {t('death.confirmationPrompt', {
            name: personName,
            date: formattedDate,
          })}
        </Text>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button
            title={t('death.confirmButton')}
            onPress={onConfirm}
            loading={isLoading}
            disabled={isLoading}
            size="md"
            accessibilityLabel={t('death.confirmButton')}
          />
        </View>
        <View className="flex-1">
          <Button
            title={t('death.disputeButton')}
            onPress={onDispute}
            variant="outline"
            loading={isLoading}
            disabled={isLoading}
            size="md"
            accessibilityLabel={t('death.disputeButton')}
          />
        </View>
      </View>
    </View>
  );
}
