const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 255;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 200;
const VALID_LANGUAGES = ['bg', 'en'];

export function validateEmail(email) {
  const trimmed = (email || '').trim();

  if (!trimmed) {
    return { valid: false, error: 'validation.emailRequired' };
  }
  if (trimmed.length > MAX_EMAIL_LENGTH) {
    return { valid: false, error: 'validation.emailTooLong' };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: 'validation.emailInvalid' };
  }

  return { valid: true, error: null };
}

export function validatePassword(password) {
  const val = password || '';

  const checks = {
    minLength: val.length >= MIN_PASSWORD_LENGTH,
    hasUppercase: /[A-Z]/.test(val),
    hasLowercase: /[a-z]/.test(val),
    hasDigit: /[0-9]/.test(val),
  };

  if (!val) {
    return { valid: false, error: 'validation.passwordRequired', checks };
  }
  if (val.length < MIN_PASSWORD_LENGTH) {
    return { valid: false, error: 'validation.passwordTooShort', checks };
  }
  if (val.length > MAX_PASSWORD_LENGTH) {
    return { valid: false, error: 'validation.passwordTooLong', checks };
  }
  if (!checks.hasUppercase) {
    return { valid: false, error: 'validation.passwordNeedsUppercase', checks };
  }
  if (!checks.hasLowercase) {
    return { valid: false, error: 'validation.passwordNeedsLowercase', checks };
  }
  if (!checks.hasDigit) {
    return { valid: false, error: 'validation.passwordNeedsDigit', checks };
  }

  return { valid: true, error: null, checks };
}

export function validateConfirmPassword(password, confirmPassword) {
  const val = confirmPassword || '';

  if (!val) {
    return { valid: false, error: 'validation.confirmPasswordRequired' };
  }
  if (val !== password) {
    return { valid: false, error: 'validation.passwordsMismatch' };
  }

  return { valid: true, error: null };
}

export function validateFullName(fullName) {
  const trimmed = (fullName || '').trim();

  if (!trimmed) {
    return { valid: false, error: 'validation.fullNameRequired' };
  }
  if (trimmed.length < MIN_NAME_LENGTH) {
    return { valid: false, error: 'validation.fullNameTooShort' };
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    return { valid: false, error: 'validation.fullNameTooLong' };
  }

  return { valid: true, error: null };
}

export function validateLanguage(language) {
  if (!VALID_LANGUAGES.includes(language)) {
    return { valid: false, error: 'validation.languageInvalid' };
  }

  return { valid: true, error: null };
}

export function validateLoginForm({ email, password }) {
  const emailResult = validateEmail(email);
  const passwordResult = validatePassword(password);

  return {
    valid: emailResult.valid && passwordResult.valid,
    errors: {
      email: emailResult.error,
      password: passwordResult.error,
    },
  };
}

export function validateRegisterForm({ email, password, confirmPassword, fullName, language }) {
  const emailResult = validateEmail(email);
  const passwordResult = validatePassword(password);
  const confirmResult = validateConfirmPassword(password, confirmPassword);
  const nameResult = validateFullName(fullName);
  const langResult = validateLanguage(language);

  return {
    valid: emailResult.valid && passwordResult.valid && confirmResult.valid && nameResult.valid && langResult.valid,
    errors: {
      email: emailResult.error,
      password: passwordResult.error,
      confirmPassword: confirmResult.error,
      fullName: nameResult.error,
      language: langResult.error,
    },
  };
}

export function validateForgotPasswordForm({ email }) {
  const emailResult = validateEmail(email);

  return {
    valid: emailResult.valid,
    errors: {
      email: emailResult.error,
    },
  };
}
