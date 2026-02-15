import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function ForgotPassword() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="font-sans-bold text-2xl text-text-primary">
        {t('auth.forgotPassword')}
      </Text>
      <Text className="font-sans text-base text-text-secondary mt-2">
        Phase 1.2
      </Text>
    </View>
  );
}
