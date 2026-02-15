import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useForm } from '../../../hooks/useForm';
import { validateDeathRecordForm } from '../../../lib/validators/deathValidators';
import { getRelativeById } from '../../../services/relatives.service';
import { createDeathRecord } from '../../../services/death.service';
import TextInput from '../../../components/ui/TextInput';
import Button from '../../../components/ui/Button';
import PartialDatePicker from '../../../components/ui/PartialDatePicker';
import { colors } from '../../../constants/colors';

function buildPayload(values, relativeId) {
  const payload = { relativeId, deathYear: values.deathYear };

  if (values.deathMonth != null) payload.deathMonth = values.deathMonth;
  if (values.deathDay != null) payload.deathDay = values.deathDay;

  const time = (values.deathTime || '').trim();
  if (time) payload.deathTime = time;

  const cause = (values.causeOfDeath || '').trim();
  if (cause) payload.causeOfDeath = cause;

  return payload;
}

export default function RecordDeath() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [person, setPerson] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const validate = useCallback(
    (vals) => validateDeathRecordForm(vals, person),
    [person],
  );

  const {
    values,
    errors,
    setFieldValue,
    setFieldTouched,
    handleSubmit,
    setErrors,
    isSubmitting,
  } = useForm({
    initialValues: {
      deathYear: null,
      deathMonth: null,
      deathDay: null,
      deathTime: '',
      causeOfDeath: '',
    },
    validate,
  });

  // Load person data on mount
  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    (async () => {
      try {
        const { data } = await getRelativeById(id);
        const relative = data.data;

        if (cancelled) return;

        if (relative.status === 'DECEASED') {
          setLoadError('deceased');
        } else {
          setPerson(relative);
        }
      } catch (err) {
        console.error('Failed to load person for death record:', err);
        if (!cancelled) setLoadError('generic');
      } finally {
        if (!cancelled) setIsLoadingData(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  const handleSave = useCallback(
    async (formValues) => {
      try {
        const payload = buildPayload(formValues, id);
        const { data: res } = await createDeathRecord(payload);

        const isSolo = res.data?.confirmationsNeeded === 0;
        const messageKey = isSolo ? 'death.recordSuccessSolo' : 'death.recordSuccess';

        Alert.alert(t('common.done'), t(messageKey));
        router.back();
      } catch (err) {
        const status = err.response?.status;

        if (status === 400) {
          const msg = err.response.data?.message || '';
          if (msg.toLowerCase().includes('deceased')) {
            Alert.alert(t('common.error'), t('death.alreadyDeceased'));
          } else {
            Alert.alert(t('common.error'), t('death.recordError'));
          }
        } else if (status === 409) {
          Alert.alert(t('common.error'), t('death.alreadyPending'));
        } else if (!err.response) {
          Alert.alert(t('common.error'), t('errors.network'));
        } else {
          Alert.alert(t('common.error'), t('death.recordError'));
        }
      }
    },
    [id, t, router],
  );

  // Loading state
  if (isLoadingData) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </SafeAreaView>
    );
  }

  // Error: person already deceased
  if (loadError === 'deceased') {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <Header onBack={() => router.back()} title={t('death.recordDeathTitle')} backLabel={t('common.back')} />
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="flower-outline" size={48} color={colors.text.muted} />
          <Text className="font-sans-medium text-base text-text-secondary text-center mt-4 mb-6">
            {t('death.alreadyDeceased')}
          </Text>
          <Button
            title={t('common.back')}
            onPress={() => router.back()}
            variant="outline"
            icon="arrow-back"
          />
        </View>
      </SafeAreaView>
    );
  }

  // Error: generic load error
  if (loadError) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <Header onBack={() => router.back()} title={t('death.recordDeathTitle')} backLabel={t('common.back')} />
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="alert-circle-outline" size={48} color={colors.text.muted} />
          <Text className="font-sans-medium text-base text-text-secondary text-center mt-4 mb-6">
            {t('person.loadError')}
          </Text>
          <Button
            title={t('common.back')}
            onPress={() => router.back()}
            variant="outline"
            icon="arrow-back"
          />
        </View>
      </SafeAreaView>
    );
  }

  const firstName = person?.fullName?.split(' ')[0] || '';

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <Header
        onBack={() => router.back()}
        title={`${t('death.recordDeathTitle')} — ${firstName}`}
        backLabel={t('common.back')}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 pt-4 pb-8">
            {/* Respectful introduction */}
            <View className="bg-surface rounded-2xl p-4 mb-6">
              <View className="flex-row items-start">
                <Ionicons
                  name="flower-outline"
                  size={20}
                  color={colors.secondary.DEFAULT}
                  style={{ marginTop: 2, marginRight: 10 }}
                />
                <Text className="font-sans text-sm text-text-secondary leading-5 flex-1">
                  {t('death.respectfulNote')}
                </Text>
              </View>
            </View>

            {/* Death Date (year required) */}
            <PartialDatePicker
              label={t('death.deathDate')}
              year={values.deathYear}
              month={values.deathMonth}
              day={values.deathDay}
              onChangeYear={(v) => setFieldValue('deathYear', v)}
              onChangeMonth={(v) => setFieldValue('deathMonth', v)}
              onChangeDay={(v) => setFieldValue('deathDay', v)}
              onBlur={() => setFieldTouched('deathDate')}
              error={errors.deathDate ? t(errors.deathDate) : null}
            />

            {/* Death Time (optional) */}
            <TextInput
              label={t('death.deathTime')}
              value={values.deathTime}
              onChangeText={(v) => setFieldValue('deathTime', v)}
              onBlur={() => setFieldTouched('deathTime')}
              placeholder={t('death.deathTimePlaceholder')}
              icon="time-outline"
              keyboardType="numbers-and-punctuation"
              error={errors.deathTime ? t(errors.deathTime) : null}
              autoCapitalize="none"
            />

            {/* Cause of Death (optional) */}
            <TextInput
              label={t('death.causeOfDeath')}
              value={values.causeOfDeath}
              onChangeText={(v) => setFieldValue('causeOfDeath', v)}
              onBlur={() => setFieldTouched('causeOfDeath')}
              placeholder={t('death.causeOfDeathPlaceholder')}
              icon="document-text-outline"
              multiline
              numberOfLines={4}
              error={errors.causeOfDeath ? t(errors.causeOfDeath) : null}
              autoCapitalize="sentences"
            />

            {/* Privacy note for cause of death */}
            <View className="flex-row items-start mb-6">
              <Ionicons
                name="lock-closed-outline"
                size={14}
                color={colors.text.muted}
                style={{ marginTop: 2, marginRight: 6 }}
              />
              <Text className="font-sans text-xs text-text-muted leading-4 flex-1">
                {t('death.causeOfDeathNote')}
              </Text>
            </View>

            {/* Submit */}
            <Button
              title={t('common.save')}
              onPress={() => handleSubmit(handleSave)}
              loading={isSubmitting}
              icon="checkmark-outline"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Header({ onBack, title, backLabel }) {
  return (
    <View className="flex-row items-center px-4 py-3 border-b border-border">
      <TouchableOpacity
        onPress={onBack}
        className="p-2 mr-2"
        accessibilityLabel={backLabel}
        accessibilityRole="button"
      >
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
      </TouchableOpacity>
      <Text className="font-sans-bold text-xl text-text-primary flex-1" numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}
