import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../constants/colors';

function parseNumeric(text, min, max) {
  if (!text || text.trim() === '') return null;
  const num = parseInt(text, 10);
  if (Number.isNaN(num)) return null;
  if (num < min || num > max) return num; // let validation catch it
  return num;
}

export default function PartialDatePicker({
  label,
  year,
  month,
  day,
  onChangeYear,
  onChangeMonth,
  onChangeDay,
  onBlur,
  error,
  accessibilityLabel,
}) {
  const { t } = useTranslation();
  const [focusedField, setFocusedField] = useState(null);

  const hasYear = year != null;
  const hasMonth = month != null;

  const handleYearChange = (text) => {
    const val = parseNumeric(text, 1, 9999);
    onChangeYear(val);
    // Auto-clear dependents
    if (val == null) {
      onChangeMonth(null);
      onChangeDay(null);
    }
  };

  const handleMonthChange = (text) => {
    const val = parseNumeric(text, 1, 12);
    onChangeMonth(val);
    // Auto-clear day
    if (val == null) {
      onChangeDay(null);
    }
  };

  const handleDayChange = (text) => {
    const val = parseNumeric(text, 1, 31);
    onChangeDay(val);
  };

  const handleFocus = (field) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField(null);
    if (onBlur) onBlur();
  };

  const borderClass = error
    ? 'border-error'
    : focusedField
      ? 'border-primary'
      : 'border-border';

  const iconColor = error
    ? colors.error
    : focusedField
      ? colors.primary.DEFAULT
      : colors.text.muted;

  return (
    <View className="mb-4" accessibilityLabel={accessibilityLabel || label}>
      {label ? (
        <Text className="font-sans-medium text-sm text-text-secondary mb-1.5 ml-1">
          {label}
        </Text>
      ) : null}

      <View
        className={`flex-row items-center bg-surface rounded-2xl border px-3 ${borderClass}`}
        style={{ minHeight: 56 }}
      >
        {/* Year */}
        <View style={{ flex: 4 }}>
          <TextInput
            value={year != null ? String(year) : ''}
            onChangeText={handleYearChange}
            onFocus={() => handleFocus('year')}
            onBlur={handleBlur}
            placeholder={t('relative.year')}
            placeholderTextColor={colors.text.muted}
            keyboardType="number-pad"
            maxLength={4}
            accessibilityLabel={`${label} ${t('relative.year')}`}
            className="font-sans text-base text-text-primary text-center py-3"
          />
        </View>

        <Text className="text-text-muted mx-1">/</Text>

        {/* Month */}
        <View style={{ flex: 3 }}>
          <TextInput
            value={hasYear && month != null ? String(month) : ''}
            onChangeText={handleMonthChange}
            onFocus={() => handleFocus('month')}
            onBlur={handleBlur}
            placeholder={t('relative.month')}
            placeholderTextColor={colors.text.muted}
            keyboardType="number-pad"
            maxLength={2}
            editable={hasYear}
            accessibilityLabel={`${label} ${t('relative.month')}`}
            className={`font-sans text-base text-center py-3 ${hasYear ? 'text-text-primary' : 'text-text-muted'}`}
          />
        </View>

        <Text className="text-text-muted mx-1">/</Text>

        {/* Day */}
        <View style={{ flex: 3 }}>
          <TextInput
            value={hasMonth && day != null ? String(day) : ''}
            onChangeText={handleDayChange}
            onFocus={() => handleFocus('day')}
            onBlur={handleBlur}
            placeholder={t('relative.day')}
            placeholderTextColor={colors.text.muted}
            keyboardType="number-pad"
            maxLength={2}
            editable={hasMonth}
            accessibilityLabel={`${label} ${t('relative.day')}`}
            className={`font-sans text-base text-center py-3 ${hasMonth ? 'text-text-primary' : 'text-text-muted'}`}
          />
        </View>
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
