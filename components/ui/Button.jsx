import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

const VARIANTS = {
  primary: {
    container: 'bg-primary rounded-2xl',
    text: 'text-white',
    spinnerColor: '#FFFFFF',
    iconColor: '#FFFFFF',
  },
  outline: {
    container: 'border-2 border-primary bg-transparent rounded-2xl',
    text: 'text-primary',
    spinnerColor: colors.primary.DEFAULT,
    iconColor: colors.primary.DEFAULT,
  },
  text: {
    container: 'bg-transparent',
    text: 'text-primary',
    spinnerColor: colors.primary.DEFAULT,
    iconColor: colors.primary.DEFAULT,
  },
  danger: {
    container: 'bg-[#EF4444] rounded-2xl',
    text: 'text-white',
    spinnerColor: '#FFFFFF',
    iconColor: '#FFFFFF',
  },
};

const SIZES = {
  lg: {
    container: { minHeight: 56 },
    textClass: 'font-sans-bold text-lg',
    iconSize: 22,
  },
  md: {
    container: { minHeight: 44 },
    textClass: 'font-sans-semibold text-base',
    iconSize: 18,
  },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  size = 'lg',
  accessibilityLabel,
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.lg;
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={isDisabled ? undefined : onPress}
      className={`flex-row items-center justify-center px-6 ${v.container} ${isDisabled ? 'opacity-50' : ''}`}
      style={s.container}
      activeOpacity={isDisabled ? 1 : 0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={v.spinnerColor} size="small" />
      ) : (
        <View className="flex-row items-center">
          {icon ? (
            <Ionicons
              name={icon}
              size={s.iconSize}
              color={v.iconColor}
              style={{ marginRight: 8 }}
            />
          ) : null}
          <Text className={`${s.textClass} ${v.text}`}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
