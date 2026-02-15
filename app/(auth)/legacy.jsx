import { View, Text } from 'react-native';

export default function Legacy() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="font-sans-bold text-2xl text-text-primary">
        Legacy Key
      </Text>
      <Text className="font-sans text-base text-text-secondary mt-2">
        Phase 3.5
      </Text>
    </View>
  );
}
