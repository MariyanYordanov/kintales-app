import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';

export function useAudioPlayer() {
  const soundRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

  const onPlaybackStatusUpdate = useCallback((status) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error('Playback error:', status.error);
      }
      return;
    }

    setPositionMs(status.positionMillis || 0);
    setDurationMs(status.durationMillis || 0);
    setIsPlaying(status.isPlaying);

    if (status.didJustFinish) {
      setIsPlaying(false);
      setPositionMs(0);
    }
  }, []);

  const loadSound = useCallback(async (uri) => {
    // Unload previous sound
    if (soundRef.current) {
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
      setIsLoaded(false);
      setIsPlaying(false);
      setPositionMs(0);
      setDurationMs(0);
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate,
      );

      soundRef.current = sound;
      setIsLoaded(true);

      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        setDurationMs(status.durationMillis || 0);
      }
    } catch (err) {
      console.error('Failed to load sound:', err);
      setIsLoaded(false);
    }
  }, [onPlaybackStatusUpdate]);

  const play = useCallback(async () => {
    if (!soundRef.current || !isLoaded) return;

    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded && status.didJustFinish) {
        await soundRef.current.setPositionAsync(0);
      }
      await soundRef.current.playAsync();
    } catch (err) {
      console.error('Failed to play:', err);
    }
  }, [isLoaded]);

  const pause = useCallback(async () => {
    if (!soundRef.current || !isLoaded) return;

    try {
      await soundRef.current.pauseAsync();
    } catch (err) {
      console.error('Failed to pause:', err);
    }
  }, [isLoaded]);

  const seekTo = useCallback(async (ms) => {
    if (!soundRef.current || !isLoaded) return;

    try {
      await soundRef.current.setPositionAsync(ms);
    } catch (err) {
      console.error('Failed to seek:', err);
    }
  }, [isLoaded]);

  const unload = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
    setIsLoaded(false);
    setIsPlaying(false);
    setPositionMs(0);
    setDurationMs(0);
  }, []);

  return {
    loadSound,
    play,
    pause,
    seekTo,
    unload,
    isLoaded,
    isPlaying,
    positionMs,
    durationMs,
  };
}
