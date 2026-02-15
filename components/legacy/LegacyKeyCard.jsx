import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../constants/colors';

const STATUS_COLORS = {
  ACTIVE: '#22C55E',
  USED: '#8B5CF6',
  REVOKED: '#A8A29E',
};

const STATUS_KEYS = {
  ACTIVE: 'legacy.statusActive',
  USED: 'legacy.statusUsed',
  REVOKED: 'legacy.statusRevoked',
};

const TYPE_KEYS = {
  EMAIL_LINK: 'legacy.keyTypeEmail',
  QR_CODE: 'legacy.keyTypeQR',
  BOTH: 'legacy.keyTypeBoth',
};

function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function LegacyKeyCard({ legacyKey, onCopy, onRevoke, onPrint }) {
  const { t } = useTranslation();

  const statusColor = STATUS_COLORS[legacyKey.status] || STATUS_COLORS.ACTIVE;

  return (
    <View className="bg-surface rounded-2xl p-4 mb-3">
      {/* Key code row */}
      <View className="flex-row items-center">
        <Ionicons name="key-outline" size={20} color={colors.primary.DEFAULT} />
        <Text
          className="font-sans-bold text-base text-text-primary flex-1 ml-2"
          style={{ fontVariant: ['tabular-nums'], letterSpacing: 0.5 }}
          numberOfLines={1}
        >
          {legacyKey.keyCode}
        </Text>
        {legacyKey.status === 'ACTIVE' && (
          <TouchableOpacity
            onPress={() => onCopy(legacyKey.keyCode)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={t('legacy.copySuccess')}
          >
            <Ionicons name="copy-outline" size={20} color={colors.text.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Status + type + date */}
      <View className="flex-row items-center mt-2 flex-wrap">
        <View
          className="rounded-full px-2 py-0.5 mr-2"
          style={{ backgroundColor: `${statusColor}15` }}
        >
          <Text className="font-sans-medium text-xs" style={{ color: statusColor }}>
            {t(STATUS_KEYS[legacyKey.status] || STATUS_KEYS.ACTIVE)}
          </Text>
        </View>
        <Text className="font-sans text-xs text-text-muted mr-2">
          {t(TYPE_KEYS[legacyKey.keyType] || TYPE_KEYS.QR_CODE)}
        </Text>
        <Text className="font-sans text-xs text-text-muted">
          {formatDate(legacyKey.createdAt)}
        </Text>
      </View>

      {/* Recipient info */}
      {legacyKey.recipientName ? (
        <Text className="font-sans text-sm text-text-secondary mt-2" numberOfLines={1}>
          {legacyKey.recipientName}
          {legacyKey.recipientEmail ? ` (${legacyKey.recipientEmail})` : ''}
        </Text>
      ) : null}

      {/* Actions */}
      {legacyKey.status === 'ACTIVE' ? (
        <View className="flex-row items-center mt-3 border-t border-border pt-3">
          <TouchableOpacity
            onPress={() => onPrint(legacyKey)}
            className="flex-row items-center mr-4"
            accessibilityRole="button"
          >
            <Ionicons name="print-outline" size={16} color={colors.primary.DEFAULT} />
            <Text className="font-sans-medium text-sm text-primary ml-1">
              {t('legacy.printQR')}
            </Text>
          </TouchableOpacity>

          <View className="flex-1" />

          <TouchableOpacity
            onPress={() => onRevoke(legacyKey)}
            className="flex-row items-center"
            accessibilityRole="button"
          >
            <Ionicons name="close-circle-outline" size={16} color={colors.text.muted} />
            <Text className="font-sans-medium text-sm text-text-muted ml-1">
              {t('legacy.revokeConfirm')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}
