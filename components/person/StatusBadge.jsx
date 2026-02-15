import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

const STATUS_CONFIG = {
  ALIVE: {
    icon: 'checkmark-circle-outline',
    color: colors.success,
    labelKey: 'relative.statusAlive',
  },
  DECEASED: {
    icon: 'flower-outline',
    color: colors.text.muted,
    labelKey: 'relative.statusDeceased',
  },
  MISSING: {
    icon: 'help-circle-outline',
    color: colors.secondary.DEFAULT,
    labelKey: 'relative.statusMissing',
  },
  UNKNOWN: {
    icon: 'help-outline',
    color: colors.text.muted,
    labelKey: 'relative.statusUnknown',
  },
};

export default function StatusBadge({ status }) {
  const { t } = useTranslation();
  const config = STATUS_CONFIG[status];

  if (!config) return null;

  return (
    <View
      className="flex-row items-center bg-surface-secondary rounded-full px-3 py-1.5 self-center"
      accessibilityRole="text"
      accessibilityLabel={t(config.labelKey)}
    >
      <Ionicons name={config.icon} size={16} color={config.color} />
      <Text
        className="font-sans-medium text-sm ml-1.5"
        style={{ color: config.color }}
      >
        {t(config.labelKey)}
      </Text>
    </View>
  );
}
