import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

export default function StoryPromptBanner({ relative, onPress }) {
  const { t } = useTranslation();

  if (!relative) return null;

  const firstName = relative.fullName?.split(' ')[0] || relative.fullName;

  return (
    <TouchableOpacity
      onPress={() => onPress(relative.id)}
      className="rounded-2xl p-4 border"
      style={{
        backgroundColor: `${colors.primary.DEFAULT}08`,
        borderColor: `${colors.primary.DEFAULT}20`,
      }}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={t('dashboard.storyPrompt', { name: firstName })}
    >
      <View className="flex-row items-center">
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={24}
          color={colors.primary.DEFAULT}
        />
        <Text className="font-sans-medium text-sm text-text-primary flex-1 ml-3 mr-2 leading-5">
          {t('dashboard.storyPrompt', { name: firstName })}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.primary.DEFAULT}
        />
      </View>
    </TouchableOpacity>
  );
}
