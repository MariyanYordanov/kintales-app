import { FlatList, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

const PHOTO_SIZE = 120;

function PhotoItem({ photo }) {
  return (
    <View
      className="rounded-2xl overflow-hidden mr-3"
      style={{ width: PHOTO_SIZE, height: PHOTO_SIZE }}
    >
      <Image
        source={{ uri: photo.fileUrl }}
        style={{ width: PHOTO_SIZE, height: PHOTO_SIZE }}
        contentFit="cover"
        transition={200}
        accessibilityLabel={photo.caption || undefined}
      />
      {photo.caption ? (
        <View className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1">
          <Text className="font-sans text-xs text-white" numberOfLines={1}>
            {photo.caption}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function SkeletonItem() {
  return (
    <View
      className="rounded-2xl bg-surface-secondary mr-3"
      style={{ width: PHOTO_SIZE, height: PHOTO_SIZE }}
    />
  );
}

function EmptyState({ message }) {
  return (
    <View className="items-center py-6">
      <Ionicons name="images-outline" size={32} color={colors.text.muted} />
      <Text className="font-sans text-sm text-text-muted mt-2 text-center">
        {message}
      </Text>
    </View>
  );
}

export default function PhotoGallery({ photos, isLoading }) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <View className="flex-row">
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
      </View>
    );
  }

  if (!photos || photos.length === 0) {
    return <EmptyState message={t('person.noPhotos')} />;
  }

  return (
    <FlatList
      data={photos}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PhotoItem photo={item} />}
      horizontal
      showsHorizontalScrollIndicator={false}
    />
  );
}
