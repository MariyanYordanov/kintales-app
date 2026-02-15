import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { AUDIO_RECORDING_OPTIONS } from '../constants/media';

export function useAudioRecorder() {
  const recordingRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const [metering, setMetering] = useState(-160);
  const [recordingUri, setRecordingUri] = useState(null);
  const [recordingDurationMs, setRecordingDurationMs] = useState(0);

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync()
          .then(() => Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
          }))
          .catch(() => {});
        recordingRef.current = null;
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        return { granted: false };
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        AUDIO_RECORDING_OPTIONS,
        (status) => {
          if (status.isRecording) {
            setDurationMs(status.durationMillis || 0);
            setMetering(status.metering ?? -160);
          }
        },
        100,
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setIsPaused(false);
      setRecordingUri(null);
      setRecordingDurationMs(0);
      setDurationMs(0);
      setMetering(-160);

      return { granted: true };
    } catch (err) {
      console.error('Failed to start recording:', err);
      return { granted: true, error: err };
    }
  }, []);

  const pauseRecording = useCallback(async () => {
    if (!recordingRef.current || !isRecording) return;

    try {
      await recordingRef.current.pauseAsync();
      setIsPaused(true);
    } catch (err) {
      console.error('Failed to pause recording:', err);
    }
  }, [isRecording]);

  const resumeRecording = useCallback(async () => {
    if (!recordingRef.current || !isPaused) return;

    try {
      await recordingRef.current.startAsync();
      setIsPaused(false);
    } catch (err) {
      console.error('Failed to resume recording:', err);
    }
  }, [isPaused]);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return null;

    try {
      const status = await recordingRef.current.getStatusAsync();
      await recordingRef.current.stopAndUnloadAsync();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const uri = recordingRef.current.getURI();
      const duration = status.durationMillis || 0;

      recordingRef.current = null;
      setIsRecording(false);
      setIsPaused(false);
      setRecordingUri(uri);
      setRecordingDurationMs(duration);

      return { uri, durationMs: duration };
    } catch (err) {
      console.error('Failed to stop recording:', err);
      recordingRef.current = null;
      setIsRecording(false);
      setIsPaused(false);
      return null;
    }
  }, []);

  const cancelRecording = useCallback(async () => {
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {
        // Ignore — may already be stopped
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      recordingRef.current = null;
    }

    setIsRecording(false);
    setIsPaused(false);
    setDurationMs(0);
    setMetering(-160);
    setRecordingUri(null);
    setRecordingDurationMs(0);
  }, []);

  return {
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    isRecording,
    isPaused,
    durationMs,
    metering,
    recordingUri,
    recordingDurationMs,
  };
}
