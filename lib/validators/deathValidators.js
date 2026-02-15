import {
  validatePartialDate,
  validateDeathAfterBirth,
} from './relativeValidators';

const DEATH_TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const CAUSE_OF_DEATH_MAX = 2000;

/**
 * Validate death time (HH:MM format, optional).
 *
 * @param {string|null} time
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateDeathTime(time) {
  if (!time || time.trim() === '') {
    return { valid: true, error: null };
  }

  if (!DEATH_TIME_REGEX.test(time.trim())) {
    return { valid: false, error: 'validation.deathTimeInvalid' };
  }

  return { valid: true, error: null };
}

/**
 * Validate cause of death (optional, max 2000 chars).
 *
 * @param {string|null} cause
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateCauseOfDeath(cause) {
  if (!cause) {
    return { valid: true, error: null };
  }

  if (cause.trim().length > CAUSE_OF_DEATH_MAX) {
    return { valid: false, error: 'validation.causeOfDeathTooLong' };
  }

  return { valid: true, error: null };
}

/**
 * Composite validator for the death record form.
 *
 * @param {object} values - { deathYear, deathMonth, deathDay, deathTime, causeOfDeath }
 * @param {object|null} person - { birthYear, birthMonth, birthDay } for death-after-birth check
 * @returns {{ valid: boolean, errors: object }}
 */
export function validateDeathRecordForm(values, person) {
  // Death year is REQUIRED for death records
  const yearRequired = values.deathYear == null
    ? { valid: false, error: 'validation.deathYearRequired' }
    : { valid: true, error: null };

  // Partial date validation (only if year is present)
  const dateResult = yearRequired.valid
    ? validatePartialDate(values.deathYear, values.deathMonth, values.deathDay, 'death')
    : yearRequired;

  // Death must be after birth (only if date is structurally valid)
  let deathOrderResult = { valid: true, error: null };
  if (dateResult.valid && person?.birthYear != null) {
    deathOrderResult = validateDeathAfterBirth(
      person.birthYear, person.birthMonth, person.birthDay,
      values.deathYear, values.deathMonth, values.deathDay,
    );
  }

  const timeResult = validateDeathTime(values.deathTime);
  const causeResult = validateCauseOfDeath(values.causeOfDeath);

  const allValid =
    dateResult.valid &&
    deathOrderResult.valid &&
    timeResult.valid &&
    causeResult.valid;

  return {
    valid: allValid,
    errors: {
      deathDate: dateResult.error || deathOrderResult.error,
      deathTime: timeResult.error,
      causeOfDeath: causeResult.error,
    },
  };
}
