import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { PHOTO_MAX_DIMENSION, PHOTO_JPEG_QUALITY } from '../constants/media';

async function requestCameraPermission() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

async function requestLibraryPermission() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

function buildResizeAction(width, height) {
  if (width <= PHOTO_MAX_DIMENSION && height <= PHOTO_MAX_DIMENSION) {
    return [];
  }

  if (width >= height) {
    return [{ resize: { width: PHOTO_MAX_DIMENSION } }];
  }

  return [{ resize: { height: PHOTO_MAX_DIMENSION } }];
}

async function processPhoto(uri, width, height) {
  const actions = buildResizeAction(width, height);

  const result = await ImageManipulator.manipulateAsync(
    uri,
    actions,
    {
      compress: PHOTO_JPEG_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );

  return { uri: result.uri, width: result.width, height: result.height };
}

async function processMultiplePhotos(assets) {
  const results = [];

  for (const asset of assets) {
    const processed = await processPhoto(asset.uri, asset.width, asset.height);
    results.push(processed);
  }

  return results;
}

export function usePhotoPicker() {
  const [isProcessing, setIsProcessing] = useState(false);

  const pickFromCamera = useCallback(async () => {
    const granted = await requestCameraPermission();
    if (!granted) {
      Alert.alert('Permission Required', 'Camera access is needed to take a photo.');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (result.canceled) return null;

    setIsProcessing(true);
    try {
      const asset = result.assets[0];
      const processed = await processPhoto(asset.uri, asset.width, asset.height);
      return [processed];
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const pickPhotos = useCallback(async ({ multiple = false } = {}) => {
    const granted = await requestLibraryPermission();
    if (!granted) {
      Alert.alert('Permission Required', 'Photo library access is needed.');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: multiple,
      selectionLimit: multiple ? 10 : 1,
      quality: 1,
    });

    if (result.canceled) return null;

    setIsProcessing(true);
    try {
      return await processMultiplePhotos(result.assets);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { pickFromCamera, pickPhotos, isProcessing };
}
