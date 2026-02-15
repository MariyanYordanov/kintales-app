import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Avatar from '../profile/Avatar';
import { colors } from '../../constants/colors';

const STATUS_COLORS = {
  PENDING: '#F59E0B',
  ACCEPTED: '#22C55E',
  DECLINED: '#EF4444',
};

export default function GuardianCard({ guardian, onRemove }) {
  const { t } = useTranslation();

  const statusKey = {
    PENDING: 'guardians.statusPending',
    ACCEPTED: 'guardians.statusAccepted',
    DECLINED: 'guardians.statusDeclined',
  }[guardian.status] || 'guardians.statusPending';

  const permissionLabel = guardian.permissions === 'VIEW_ONLY'
    ? t('guardians.permissionViewOnly')
    : t('guardians.permissionFull');

  return (
    <View className="bg-surface rounded-2xl p-4 mb-3 flex-row items-center">
      <Avatar name={guardian.guardianName} size={40} />

      <View className="flex-1 ml-3">
        <Text className="font-sans-semibold text-base text-text-primary" numberOfLines={1}>
          {guardian.guardianName}
        </Text>
        <Text className="font-sans text-sm text-text-muted" numberOfLines={1}>
          {guardian.guardianEmail}
        </Text>
        <View className="flex-row items-center mt-1">
          <View
            className="rounded-full px-2 py-0.5 mr-2"
            style={{ backgroundColor: `${STATUS_COLORS[guardian.status] || STATUS_COLORS.PENDING}15` }}
          >
            <Text
              className="font-sans-medium text-xs"
              style={{ color: STATUS_COLORS[guardian.status] || STATUS_COLORS.PENDING }}
            >
              {t(statusKey)}
            </Text>
          </View>
          <Text className="font-sans text-xs text-text-muted">{permissionLabel}</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onRemove(guardian)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel={t('common.delete')}
      >
        <Ionicons name="trash-outline" size={20} color={colors.text.muted} />
      </TouchableOpacity>
    </View>
  );
}
