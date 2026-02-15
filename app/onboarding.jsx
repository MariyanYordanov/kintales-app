import { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const ONBOARDING_KEY = '@kintales/onboarding_complete';

const SCREENS = [
  { key: 'screen1', icon: 'heart-outline' },
  { key: 'screen2', icon: 'git-network-outline' },
  { key: 'screen3', icon: 'mic-outline' },
  { key: 'screen4', icon: 'shield-checkmark-outline' },
];

export default function Onboarding() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const isLastScreen = currentIndex === SCREENS.length - 1;

  const handleComplete = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(auth)/login');
  };

  const handleNext = () => {
    if (isLastScreen) {
      handleComplete();
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const renderItem = ({ item }) => (
    <View className="flex-1 items-center justify-center px-8" style={{ width }}>
      <View className="w-48 h-48 rounded-full bg-primary-light items-center justify-center mb-12">
        <Ionicons name={item.icon} size={72} color="#8B5CF6" />
      </View>
      <Text className="font-sans-bold text-3xl text-text-primary text-center mb-4">
        {t(`onboarding.${item.key}.title`)}
      </Text>
      <Text className="font-sans text-lg text-text-secondary text-center leading-7">
        {t(`onboarding.${item.key}.subtitle`)}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      {!isLastScreen && (
        <TouchableOpacity
          onPress={handleComplete}
          className="absolute top-16 right-6 z-10 p-3"
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.skip')}
        >
          <Text className="font-sans-medium text-base text-text-secondary">
            {t('onboarding.skip')}
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatListRef}
        data={SCREENS}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.key}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <View className="pb-12 px-8 items-center">
        <View className="flex-row mb-8">
          {SCREENS.map((_, index) => (
            <View
              key={index}
              className={`w-2.5 h-2.5 rounded-full mx-1.5 ${
                index === currentIndex ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          className="bg-primary w-full py-4 rounded-2xl items-center"
          style={{ minHeight: 56 }}
          accessibilityRole="button"
          accessibilityLabel={isLastScreen ? t('onboarding.getStarted') : t('onboarding.next')}
        >
          <Text className="font-sans-bold text-lg text-white">
            {isLastScreen ? t('onboarding.getStarted') : t('onboarding.next')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
