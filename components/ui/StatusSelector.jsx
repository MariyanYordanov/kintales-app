import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RELATIVE_STATUSES } from '../../constants/relationships';

const STATUS_I18N_MAP = {
  ALIVE: 'relative.statusAlive',
  DECEASED: 'relative.statusDeceased',
  MISSING: 'relative.statusMissing',
  UNKNOWN: 'relative.statusUnknown',
};

export default function StatusSelector({ value, onChange, label, error }) {
  const { t } = useTranslation();

  return (
    <View className="mb-4">
      {label ? (
        <Text className="font-sans-medium text-sm text-text-secondary mb-1.5 ml-1">
          {label}
        </Text>
      ) : null}

      <View
        className="flex-row flex-wrap bg-surface-secondary rounded-2xl p-1"
        accessibilityRole="radiogroup"
      >
        {RELATIVE_STATUSES.map((status) => {
          const isActive = value === status;

          return (
            <TouchableOpacity
              key={status}
              onPress={() => onChange(status)}
              className={`py-3 items-center rounded-xl ${isActive ? 'bg-primary' : ''}`}
              style={{ width: '50%' }}
              accessibilityRole="radio"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={t(STATUS_I18N_MAP[status])}
            >
              <Text
                className={`font-sans-semibold text-sm ${isActive ? 'text-white' : 'text-text-secondary'}`}
              >
                {t(STATUS_I18N_MAP[status])}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error ? (
        <Text
          className="font-sans text-sm text-error mt-1 ml-1"
          accessibilityRole="alert"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
