import { validateFullName } from './authValidators';
import {
  RELATIONSHIP_TYPES,
  RELATIVE_STATUSES,
  MIN_YEAR,
  MAX_YEAR,
  MAX_RELATIVE_BIO,
} from '../../constants/relationships';

/**
 * Check if a day is valid for the given month and year.
 */
function isValidDay(year, month, day) {
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Validate a partial date (year, month, day — all optional).
 * Rules:
 *   - day requires month, month requires year
 *   - year must be in MIN_YEAR..MAX_YEAR
 *   - day must be valid for the given month/year
 *
 * @param {number|null} year
 * @param {number|null} month
 * @param {number|null} day
 * @param {'birth'|'death'|'marriage'|'divorce'} prefix - for i18n error keys
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validatePartialDate(year, month, day, prefix = 'birth') {
  const hasYear = year != null;
  const hasMonth = month != null;
  const hasDay = day != null;

  // Dependency: day → month → year
  if ((hasDay && !hasMonth) || (hasMonth && !hasYear)) {
    return { valid: false, error: `validation.${prefix}DateInvalid` };
  }

  // Nothing set — valid (all fields optional)
  if (!hasYear) {
    return { valid: true, error: null };
  }

  // Year range
  if (year < MIN_YEAR || year > MAX_YEAR) {
    return { valid: false, error: `validation.${prefix}DateOutOfRange` };
  }

  // Month range
  if (hasMonth && (month < 1 || month > 12)) {
    return { valid: false, error: `validation.${prefix}DateInvalid` };
  }

  // Day validity for month/year
  if (hasDay && !isValidDay(year, month, day)) {
    return { valid: false, error: `validation.${prefix}DayInvalid` };
  }

  return { valid: true, error: null };
}

/**
 * Compare two partial dates and return true if deathDate < birthDate.
 * Only compares when both have the required granularity.
 */
export function validateDeathAfterBirth(
  birthYear, birthMonth, birthDay,
  deathYear, deathMonth, deathDay,
) {
  // Can only compare if both have at least a year
  if (birthYear == null || deathYear == null) {
    return { valid: true, error: null };
  }

  if (deathYear < birthYear) {
    return { valid: false, error: 'validation.deathBeforeBirth' };
  }

  if (deathYear === birthYear) {
    // Both have months — compare
    if (birthMonth != null && deathMonth != null) {
      if (deathMonth < birthMonth) {
        return { valid: false, error: 'validation.deathBeforeBirth' };
      }
      // Same month — compare days if both present
      if (deathMonth === birthMonth && birthDay != null && deathDay != null) {
        if (deathDay < birthDay) {
          return { valid: false, error: 'validation.deathBeforeBirth' };
        }
      }
    }
  }

  return { valid: true, error: null };
}

/**
 * Validate relative bio (optional, max 2000 chars).
 */
export function validateRelativeBio(bio) {
  const trimmed = (bio || '').trim();

  if (trimmed.length > MAX_RELATIVE_BIO) {
    return { valid: false, error: 'validation.relativeBioTooLong' };
  }

  return { valid: true, error: null };
}

/**
 * Validate relative status.
 */
export function validateRelativeStatus(status) {
  if (!RELATIVE_STATUSES.includes(status)) {
    return { valid: false, error: 'validation.statusInvalid' };
  }

  return { valid: true, error: null };
}

/**
 * Validate relationship type (null = no relationship, which is valid).
 */
export function validateRelationshipType(type) {
  if (type == null) {
    return { valid: true, error: null };
  }

  if (!RELATIONSHIP_TYPES.includes(type)) {
    return { valid: false, error: 'validation.relationshipTypeInvalid' };
  }

  return { valid: true, error: null };
}

/**
 * Composite validator for the Add Relative form.
 */
export function validateAddRelativeForm(values) {
  const nameResult = validateFullName(values.fullName);
  const statusResult = validateRelativeStatus(values.status);
  const bioResult = validateRelativeBio(values.bio);

  const birthDateResult = validatePartialDate(
    values.birthYear, values.birthMonth, values.birthDay, 'birth',
  );
  const deathDateResult = validatePartialDate(
    values.deathYear, values.deathMonth, values.deathDay, 'death',
  );

  // Death after birth check (only when both dates are structurally valid)
  let deathOrderResult = { valid: true, error: null };
  if (birthDateResult.valid && deathDateResult.valid) {
    deathOrderResult = validateDeathAfterBirth(
      values.birthYear, values.birthMonth, values.birthDay,
      values.deathYear, values.deathMonth, values.deathDay,
    );
  }

  const relationResult = validateRelationshipType(values.relationshipType);

  // If relationship type is set, a related person is required
  let relatedPersonError = null;
  if (values.relationshipType != null && !values.relatedPersonId) {
    relatedPersonError = 'validation.relatedPersonRequired';
  }

  // Marriage/divorce dates — only for spouse
  let marriageDateResult = { valid: true, error: null };
  let divorceDateResult = { valid: true, error: null };

  if (values.relationshipType === 'spouse') {
    marriageDateResult = validatePartialDate(
      values.marriageYear, values.marriageMonth, values.marriageDay, 'marriage',
    );
    divorceDateResult = validatePartialDate(
      values.divorceYear, values.divorceMonth, values.divorceDay, 'divorce',
    );
  }

  const allValid =
    nameResult.valid &&
    statusResult.valid &&
    bioResult.valid &&
    birthDateResult.valid &&
    deathDateResult.valid &&
    deathOrderResult.valid &&
    relationResult.valid &&
    !relatedPersonError &&
    marriageDateResult.valid &&
    divorceDateResult.valid;

  return {
    valid: allValid,
    errors: {
      fullName: nameResult.error,
      status: statusResult.error,
      bio: bioResult.error,
      birthDate: birthDateResult.error,
      deathDate: deathDateResult.error || deathOrderResult.error,
      relationshipType: relationResult.error,
      relatedPersonId: relatedPersonError,
      marriageDate: marriageDateResult.error,
      divorceDate: divorceDateResult.error,
    },
  };
}
