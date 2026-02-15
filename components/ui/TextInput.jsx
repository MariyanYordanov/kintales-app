import { forwardRef, useState } from 'react';
import { View, Text, TextInput as RNTextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

function StyledTextInput(
  {
    label,
    value,
    onChangeText,
    error,
    placeholder,
    icon,
    rightIcon,
    onRightIconPress,
    secureTextEntry,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    autoComplete,
    returnKeyType,
    onSubmitEditing,
    onBlur,
    editable = true,
    accessibilityLabel,
    multiline = false,
    numberOfLines,
  },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);

  const borderClass = error
    ? 'border-error'
    : isFocused
      ? 'border-primary'
      : 'border-border';

  const iconColor = error
    ? colors.error
    : isFocused
      ? colors.primary.DEFAULT
      : colors.text.muted;

  const handleFocus = () => setIsFocused(true);

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View className="mb-4">
      {label ? (
        <Text className="font-sans-medium text-sm text-text-secondary mb-1.5 ml-1">
          {label}
        </Text>
      ) : null}

      <View
        className={`flex-row ${multiline ? 'items-start' : 'items-center'} bg-surface rounded-2xl border px-4 ${borderClass}`}
        style={{ minHeight: multiline ? 120 : 56 }}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={20}
            color={iconColor}
            style={{ marginRight: 12 }}
          />
        ) : null}

        <RNTextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'auto'}
          accessibilityLabel={accessibilityLabel || label}
          className="font-sans text-base text-text-primary flex-1 py-4"
          style={{ flex: 1 }}
        />

        {rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={
              secureTextEntry ? 'Show password' : 'Hide password'
            }
          >
            <Ionicons
              name={rightIcon}
              size={22}
              color={colors.text.muted}
            />
          </TouchableOpacity>
        ) : null}
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

export default forwardRef(StyledTextInput);
