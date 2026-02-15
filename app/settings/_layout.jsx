import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '../../constants/colors';

export default function SettingsLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontFamily: 'PlusJakartaSans_600SemiBold',
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="guardians"
        options={{ title: t('guardians.title') }}
      />
      <Stack.Screen
        name="legacy-key"
        options={{ title: t('legacy.title') }}
      />
    </Stack>
  );
}
