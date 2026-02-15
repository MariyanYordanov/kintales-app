import { ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';

const PHOTO_HEIGHT_SINGLE = 220;
const PHOTO_HEIGHT_MULTI = 160;
const PHOTO_WIDTH_MULTI = 200;

export default function StoryPhotos({ photos, onPressPhoto }) {
  const { width: screenWidth } = useWindowDimensions();

  if (!photos || photos.length === 0) return null;

  // Single photo — full width
  if (photos.length === 1) {
    return (
      <TouchableOpacity
        onPress={() => onPressPhoto(0)}
        activeOpacity={0.9}
        accessibilityRole="image"
        accessibilityLabel={photos[0].caption || 'Photo'}
      >
        <Image
          source={{ uri: photos[0].fileUrl }}
          style={{
            width: screenWidth - 32,
            height: PHOTO_HEIGHT_SINGLE,
            marginHorizontal: 16,
            borderRadius: 12,
          }}
          contentFit="cover"
          transition={200}
        />
      </TouchableOpacity>
    );
  }

  // Multiple photos — horizontal scroll
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
    >
      {photos.map((photo, index) => (
        <TouchableOpacity
          key={photo.id}
          onPress={() => onPressPhoto(index)}
          activeOpacity={0.9}
          accessibilityRole="image"
          accessibilityLabel={photo.caption || `Photo ${index + 1}`}
        >
          <Image
            source={{ uri: photo.fileUrl }}
            style={{
              width: PHOTO_WIDTH_MULTI,
              height: PHOTO_HEIGHT_MULTI,
              borderRadius: 12,
            }}
            contentFit="cover"
            transition={200}
          />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
