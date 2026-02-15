import { TouchableOpacity, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../constants/colors';

export default function GoogleButton({ disabled = false }) {
  const { t } = useTranslation();

  const handlePress = () => {
    Alert.alert(t('common.comingSoon'), t('auth.googleComingSoon'));
  };

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : handlePress}
      className={`flex-row items-center justify-center bg-surface border border-border rounded-2xl px-6 ${disabled ? 'opacity-50' : ''}`}
      style={{ minHeight: 56 }}
      activeOpacity={disabled ? 1 : 0.7}
      accessibilityRole="button"
      accessibilityLabel={t('auth.signInGoogle')}
      accessibilityState={{ disabled }}
    >
      <Ionicons name="logo-google" size={22} color={colors.text.primary} />
      <Text className="font-sans-semibold text-base text-text-primary ml-3">
        {t('auth.signInGoogle')}
      </Text>
    </TouchableOpacity>
  );
}
