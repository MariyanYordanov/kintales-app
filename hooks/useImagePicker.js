import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const AVATAR_SIZE = 400;
const JPEG_QUALITY = 0.8;

async function requestCameraPermission() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

async function requestLibraryPermission() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

async function processImage(uri) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: AVATAR_SIZE, height: AVATAR_SIZE } }],
    {
      compress: JPEG_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );
  return result;
}

export function useImagePicker() {
  const [isProcessing, setIsProcessing] = useState(false);

  const pickFromCamera = useCallback(async () => {
    const granted = await requestCameraPermission();
    if (!granted) {
      Alert.alert('Permission Required', 'Camera access is needed to take a photo.');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.canceled) return null;

    setIsProcessing(true);
    try {
      return await processImage(result.assets[0].uri);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const pickFromLibrary = useCallback(async () => {
    const granted = await requestLibraryPermission();
    if (!granted) {
      Alert.alert('Permission Required', 'Photo library access is needed.');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.canceled) return null;

    setIsProcessing(true);
    try {
      return await processImage(result.assets[0].uri);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { pickFromCamera, pickFromLibrary, isProcessing };
}
