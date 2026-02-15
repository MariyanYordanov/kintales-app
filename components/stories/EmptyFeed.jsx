import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Button from '../ui/Button';
import { colors } from '../../constants/colors';

export default function EmptyFeed({ onCreateStory }) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center px-8">
      <View
        className="w-24 h-24 rounded-full items-center justify-center mb-6"
        style={{ backgroundColor: `${colors.primary.DEFAULT}10` }}
      >
        <Ionicons name="book-outline" size={48} color={colors.primary.DEFAULT} />
      </View>
      <Text className="font-sans-bold text-2xl text-text-primary text-center mb-3">
        {t('stories.emptyTitle')}
      </Text>
      <Text className="font-sans text-base text-text-secondary text-center mb-8 leading-6">
        {t('stories.emptySubtitle')}
      </Text>
      {onCreateStory ? (
        <Button
          title={t('stories.createFirstStory')}
          onPress={onCreateStory}
          icon="add-circle-outline"
        />
      ) : null}
    </View>
  );
}
