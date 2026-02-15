export const PHOTO_MAX_DIMENSION = 1920;
export const PHOTO_JPEG_QUALITY = 0.75;
export const PHOTO_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const PHOTO_CAPTION_MAX = 500;

export const AUDIO_MAX_SIZE_BYTES = 20 * 1024 * 1024;
export const AUDIO_TITLE_MAX = 200;

export const AUDIO_RECORDING_OPTIONS = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: 2,
    audioEncoder: 3,
  },
  ios: {
    extension: '.m4a',
    outputFormat: 'aac',
    audioQuality: 96,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

export const AUDIO_MIME_MAP = {
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  webm: 'audio/webm',
};
