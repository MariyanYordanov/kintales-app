import { PHOTO_CAPTION_MAX, AUDIO_TITLE_MAX } from '../../constants/media';

export function validatePhotoCaption(caption) {
  if (!caption || caption.trim().length === 0) {
    return { valid: true, error: null };
  }

  if (caption.trim().length > PHOTO_CAPTION_MAX) {
    return { valid: false, error: 'validation.captionTooLong' };
  }

  return { valid: true, error: null };
}

export function validateAudioTitle(title) {
  if (!title || title.trim().length === 0) {
    return { valid: true, error: null };
  }

  if (title.trim().length > AUDIO_TITLE_MAX) {
    return { valid: false, error: 'validation.titleTooLong' };
  }

  return { valid: true, error: null };
}

export function validatePhotoDate(year, month, day) {
  if (year == null && month == null && day == null) {
    return { valid: true, error: null };
  }

  if (day != null && month == null) {
    return { valid: false, error: 'validation.photoDateInvalid' };
  }

  if (month != null && year == null) {
    return { valid: false, error: 'validation.photoDateInvalid' };
  }

  if (year != null && (year < 1700 || year > 2100)) {
    return { valid: false, error: 'validation.photoDateOutOfRange' };
  }

  if (month != null && (month < 1 || month > 12)) {
    return { valid: false, error: 'validation.photoDateInvalid' };
  }

  if (day != null && year != null && month != null) {
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) {
      return { valid: false, error: 'validation.photoDateInvalid' };
    }
  }

  return { valid: true, error: null };
}
