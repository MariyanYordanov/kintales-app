import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

export function SkeletonBox({ width = '100%', height = 20, className = '', style = {} }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 }),
      ),
      -1,
      false,
    );

    return () => {
      cancelAnimation(opacity);
    };
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className={`bg-border rounded-lg ${className}`}
      style={[{ width, height }, style, animatedStyle]}
    />
  );
}

export function SkeletonStoryCard() {
  return (
    <View className="bg-surface rounded-2xl p-4 mb-4">
      <View className="flex-row items-center mb-3">
        <SkeletonBox width={40} height={40} className="rounded-full mr-3" />
        <View className="flex-1">
          <SkeletonBox width="60%" height={14} className="mb-2" />
          <SkeletonBox width="40%" height={12} />
        </View>
      </View>
      <SkeletonBox width="100%" height={60} className="mb-3 rounded-xl" />
      <SkeletonBox width="100%" height={180} className="rounded-xl" />
    </View>
  );
}

export function SkeletonEventCard() {
  return (
    <View className="bg-surface rounded-2xl p-4 mb-3">
      <View className="flex-row items-center">
        <SkeletonBox width={36} height={36} className="rounded-full mr-3" />
        <View className="flex-1">
          <SkeletonBox width="70%" height={14} className="mb-2" />
          <SkeletonBox width="45%" height={12} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonTimelineEntry() {
  return (
    <View className="flex-row mb-4">
      <View className="items-center mr-3">
        <SkeletonBox width={12} height={12} className="rounded-full" />
        <SkeletonBox width={2} height={60} className="mt-1" />
      </View>
      <View className="flex-1 bg-surface rounded-2xl p-4">
        <SkeletonBox width="50%" height={12} className="mb-2" />
        <SkeletonBox width="80%" height={14} className="mb-2" />
        <SkeletonBox width="60%" height={12} />
      </View>
    </View>
  );
}
