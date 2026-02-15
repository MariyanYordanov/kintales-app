import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../constants/colors';

const ONBOARDING_KEY = '@kintales/onboarding_complete';

export default function Index() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const navigate = async () => {
      const hasOnboarded = await AsyncStorage.getItem(ONBOARDING_KEY);

      if (!hasOnboarded) {
        router.replace('/onboarding');
      } else if (!user) {
        router.replace('/(auth)/login');
      } else {
        router.replace('/(tabs)');
      }
    };

    navigate();
  }, [user, isLoading]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
    </View>
  );
}
