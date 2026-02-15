import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

export default function PhotoLightbox({ photos, initialIndex, visible, onClose, onDelete }) {
  const { t } = useTranslation();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const flatListRef = useRef(null);

  const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const handleDelete = useCallback(() => {
    if (!onDelete) return;

    const photo = photos[currentIndex];
    if (!photo) return;

    Alert.alert(
      t('common.delete'),
      t('media.deletePhotoConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            onDelete(photo.id);
            if (photos.length <= 1) {
              onClose();
            }
          },
        },
      ],
    );
  }, [currentIndex, photos, onDelete, onClose, t]);

  const renderItem = useCallback(({ item }) => (
    <View style={{ width: screenWidth, height: screenHeight }}>
      <Image
        source={{ uri: item.fileUrl }}
        style={{ width: screenWidth, height: screenHeight }}
        contentFit="contain"
        transition={200}
        accessibilityLabel={item.caption || undefined}
      />
    </View>
  ), [screenWidth, screenHeight]);

  const photo = photos[currentIndex];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          {/* Header */}
          <View className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between px-4 py-2">
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <Text className="font-sans-medium text-sm text-white">
              {t('media.photoOf', { index: currentIndex + 1, total: photos.length })}
            </Text>

            {onDelete ? (
              <TouchableOpacity
                onPress={handleDelete}
                className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel={t('common.delete')}
              >
                <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <View className="w-10" />
            )}
          </View>

          {/* Photos */}
          <FlatList
            ref={flatListRef}
            data={photos}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialIndex || 0}
            getItemLayout={(_, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />

          {/* Caption */}
          {photo?.caption ? (
            <View className="absolute bottom-0 left-0 right-0 z-10 bg-black/60 px-6 py-4">
              <Text className="font-sans text-base text-white text-center">
                {photo.caption}
              </Text>
            </View>
          ) : null}
        </SafeAreaView>
      </View>
    </Modal>
  );
}
