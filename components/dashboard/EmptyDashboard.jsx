import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Button from '../ui/Button';
import { colors } from '../../constants/colors';

export default function EmptyDashboard({ variant, onCreateTree }) {
  const { t } = useTranslation();

  const isNoTree = variant === 'no-tree';
  const icon = isNoTree ? 'people-outline' : 'calendar-outline';
  const titleKey = isNoTree ? 'dashboard.emptyNoTreeTitle' : 'dashboard.emptyNoEventsTitle';
  const subtitleKey = isNoTree ? 'dashboard.emptyNoTreeSubtitle' : 'dashboard.emptyNoEventsSubtitle';

  return (
    <View className="flex-1 items-center justify-center px-8">
      <View
        className="w-24 h-24 rounded-full items-center justify-center mb-6"
        style={{ backgroundColor: `${colors.primary.DEFAULT}10` }}
      >
        <Ionicons name={icon} size={48} color={colors.primary.DEFAULT} />
      </View>
      <Text className="font-sans-bold text-2xl text-text-primary text-center mb-3">
        {t(titleKey)}
      </Text>
      <Text className="font-sans text-base text-text-secondary text-center mb-8 leading-6">
        {t(subtitleKey)}
      </Text>
      {isNoTree ? (
        <Button
          title={t('dashboard.createTree')}
          onPress={onCreateTree}
          icon="add-outline"
        />
      ) : null}
    </View>
  );
}
