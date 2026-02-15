import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import PhotoLightbox from '../media/PhotoLightbox';
import { colors } from '../../constants/colors';

const GRID_COLUMNS = 3;
const GRID_GAP = 8;

function AddButton({ size, onPress, label }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ width: size, height: size }}
      className="rounded-2xl border-2 border-dashed border-border items-center justify-center"
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name="camera-outline" size={28} color={colors.text.muted} />
      <Text className="font-sans text-xs text-text-muted mt-1">{label}</Text>
    </TouchableOpacity>
  );
}

function PhotoItem({ photo, size, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ width: size, height: size }}
      className="rounded-2xl overflow-hidden"
      accessibilityRole="image"
      accessibilityLabel={photo.caption || undefined}
    >
      <Image
        source={{ uri: photo.fileUrl }}
        style={{ width: size, height: size }}
        contentFit="cover"
        transition={200}
      />
      {photo.caption ? (
        <View className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1">
          <Text className="font-sans text-xs text-white" numberOfLines={1}>
            {photo.caption}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

function SkeletonGrid({ itemSize }) {
  return (
    <View className="flex-row flex-wrap" style={{ gap: GRID_GAP }}>
      {Array.from({ length: 3 }, (_, i) => (
        <View
          key={i}
          className="rounded-2xl bg-surface-secondary"
          style={{ width: itemSize, height: itemSize }}
        />
      ))}
    </View>
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

export default function PhotoGallery({ photos, isLoading, onAddPress, onPhotoDeleted }) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const containerPadding = 48;
  const totalGap = GRID_GAP * (GRID_COLUMNS - 1);
  const itemSize = Math.floor((screenWidth - containerPadding - totalGap) / GRID_COLUMNS);

  const handlePhotoPress = useCallback((index) => {
    setLightboxIndex(index);
  }, []);

  const handleLightboxClose = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const handleLightboxDelete = useCallback((photoId) => {
    setLightboxIndex(null);
    if (onPhotoDeleted) onPhotoDeleted(photoId);
  }, [onPhotoDeleted]);

  if (isLoading) {
    return <SkeletonGrid itemSize={itemSize} />;
  }

  const hasPhotos = photos && photos.length > 0;

  if (!hasPhotos && !onAddPress) {
    return <EmptyState message={t('person.noPhotos')} />;
  }

  return (
    <>
      <View className="flex-row flex-wrap" style={{ gap: GRID_GAP }}>
        {onAddPress ? (
          <AddButton size={itemSize} onPress={onAddPress} label={t('media.addPhoto')} />
        ) : null}

        {hasPhotos
          ? photos.map((photo, index) => (
              <PhotoItem
                key={photo.id}
                photo={photo}
                size={itemSize}
                onPress={() => handlePhotoPress(index)}
              />
            ))
          : null}
      </View>

      {hasPhotos && lightboxIndex != null ? (
        <PhotoLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          visible
          onClose={handleLightboxClose}
          onDelete={onPhotoDeleted ? handleLightboxDelete : undefined}
        />
      ) : null}
    </>
  );
}
