import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';

const OPTIONS = [
  { value: 'bg', label: 'BG', flag: '\u{1F1E7}\u{1F1EC}' },
  { value: 'en', label: 'EN', flag: '\u{1F1EC}\u{1F1E7}' },
];

export default function LanguageSelector({ value, onChange, label }) {
  return (
    <View className="mb-4">
      {label ? (
        <Text className="font-sans-medium text-sm text-text-secondary mb-1.5 ml-1">
          {label}
        </Text>
      ) : null}

      <View
        className="flex-row bg-surface-secondary rounded-2xl p-1"
        accessibilityRole="radiogroup"
      >
        {OPTIONS.map((option) => {
          const isActive = value === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onChange(option.value)}
              className={`flex-1 py-3 items-center rounded-xl ${isActive ? 'bg-primary' : ''}`}
              accessibilityRole="radio"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${option.flag} ${option.label}`}
            >
              <Text
                className={`font-sans-semibold text-base ${isActive ? 'text-white' : 'text-text-secondary'}`}
              >
                {option.flag} {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
