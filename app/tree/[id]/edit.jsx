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
import { validateEditRelativeForm } from '../../../lib/validators/relativeValidators';
import { getRelativeById, updateRelative } from '../../../services/relatives.service';
import { DEFAULT_STATUS } from '../../../constants/relationships';
import TextInput from '../../../components/ui/TextInput';
import Button from '../../../components/ui/Button';
import PartialDatePicker from '../../../components/ui/PartialDatePicker';
import StatusSelector from '../../../components/ui/StatusSelector';
import { colors } from '../../../constants/colors';

function buildEditPayload(values) {
  const payload = { fullName: values.fullName.trim() };

  if (values.birthYear != null) payload.birthYear = values.birthYear;
  if (values.birthMonth != null) payload.birthMonth = values.birthMonth;
  if (values.birthDay != null) payload.birthDay = values.birthDay;

  if (values.status === 'DECEASED') {
    if (values.deathYear != null) payload.deathYear = values.deathYear;
    if (values.deathMonth != null) payload.deathMonth = values.deathMonth;
    if (values.deathDay != null) payload.deathDay = values.deathDay;
  }

  const bio = (values.bio || '').trim();
  if (bio) payload.bio = bio;

  if (values.status !== DEFAULT_STATUS) payload.status = values.status;

  return payload;
}

export default function EditRelative() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState(false);

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
      fullName: '',
      birthYear: null,
      birthMonth: null,
      birthDay: null,
      deathYear: null,
      deathMonth: null,
      deathDay: null,
      bio: '',
      status: DEFAULT_STATUS,
    },
    validate: validateEditRelativeForm,
  });

  // Load current data and pre-fill form
  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    (async () => {
      try {
        const { data } = await getRelativeById(id);
        const person = data.data;

        if (cancelled) return;

        setFieldValue('fullName', person.fullName || '');
        setFieldValue('birthYear', person.birthYear ?? null);
        setFieldValue('birthMonth', person.birthMonth ?? null);
        setFieldValue('birthDay', person.birthDay ?? null);
        setFieldValue('deathYear', person.deathYear ?? null);
        setFieldValue('deathMonth', person.deathMonth ?? null);
        setFieldValue('deathDay', person.deathDay ?? null);
        setFieldValue('bio', person.bio || '');
        setFieldValue('status', person.status || DEFAULT_STATUS);
      } catch (err) {
        console.error('Failed to load person for edit:', err);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setIsLoadingData(false);
      }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- setFieldValue is stable (useCallback)
  }, [id]);

  const isDeceased = values.status === 'DECEASED';

  const handleStatusChange = useCallback(
    (newStatus) => {
      setFieldValue('status', newStatus);
      if (newStatus !== 'DECEASED') {
        setFieldValue('deathYear', null);
        setFieldValue('deathMonth', null);
        setFieldValue('deathDay', null);
      }
    },
    [setFieldValue],
  );

  const handleSave = useCallback(
    async (formValues) => {
      try {
        await updateRelative(id, buildEditPayload(formValues));
        Alert.alert(t('common.done'), t('person.updateSuccess'));
        router.back();
      } catch (err) {
        const status = err.response?.status;

        if (status === 400 || status === 422) {
          const serverErrors = err.response.data?.errors;
          if (Array.isArray(serverErrors)) {
            const mapped = {};
            for (const e of serverErrors) {
              if (e.field) mapped[e.field] = e.message;
            }
            setErrors(mapped);
          } else {
            Alert.alert(t('common.error'), t('person.updateError'));
          }
        } else if (!err.response) {
          Alert.alert(t('common.error'), t('errors.network'));
        } else {
          Alert.alert(t('common.error'), t('person.updateError'));
        }
      }
    },
    [id, t, setErrors, router],
  );

  // Loading person data
  if (isLoadingData) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </SafeAreaView>
    );
  }

  // Load error
  if (loadError) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-row items-center px-4 py-3 border-b border-border">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 mr-2"
            accessibilityLabel={t('common.back')}
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="alert-circle-outline" size={48} color={colors.text.muted} />
          <Text className="font-sans-medium text-base text-text-secondary text-center mt-4">
            {t('person.loadError')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-border">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 mr-2"
            accessibilityLabel={t('common.back')}
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text className="font-sans-bold text-xl text-text-primary flex-1">
            {t('person.editTitle')}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-6 pb-8">
            {/* Full Name */}
            <TextInput
              label={t('relative.fullName')}
              value={values.fullName}
              onChangeText={(v) => setFieldValue('fullName', v)}
              onBlur={() => setFieldTouched('fullName')}
              error={errors.fullName ? t(errors.fullName) : null}
              placeholder={t('relative.fullNamePlaceholder')}
              icon="person-outline"
              autoCapitalize="words"
              returnKeyType="next"
            />

            {/* Status */}
            <StatusSelector
              label={t('relative.status')}
              value={values.status}
              onChange={handleStatusChange}
              error={errors.status ? t(errors.status) : null}
            />

            {/* Birth Date */}
            <PartialDatePicker
              label={t('relative.birthDate')}
              year={values.birthYear}
              month={values.birthMonth}
              day={values.birthDay}
              onChangeYear={(v) => setFieldValue('birthYear', v)}
              onChangeMonth={(v) => setFieldValue('birthMonth', v)}
              onChangeDay={(v) => setFieldValue('birthDay', v)}
              onBlur={() => setFieldTouched('birthDate')}
              error={errors.birthDate ? t(errors.birthDate) : null}
            />

            {/* Death Date (only for DECEASED) */}
            {isDeceased ? (
              <PartialDatePicker
                label={t('relative.deathDate')}
                year={values.deathYear}
                month={values.deathMonth}
                day={values.deathDay}
                onChangeYear={(v) => setFieldValue('deathYear', v)}
                onChangeMonth={(v) => setFieldValue('deathMonth', v)}
                onChangeDay={(v) => setFieldValue('deathDay', v)}
                onBlur={() => setFieldTouched('deathDate')}
                error={errors.deathDate ? t(errors.deathDate) : null}
              />
            ) : null}

            {/* Bio */}
            <TextInput
              label={t('relative.bio')}
              value={values.bio}
              onChangeText={(v) => setFieldValue('bio', v)}
              onBlur={() => setFieldTouched('bio')}
              error={errors.bio ? t(errors.bio) : null}
              placeholder={t('relative.bioPlaceholder')}
              icon="document-text-outline"
              multiline
              numberOfLines={4}
              autoCapitalize="sentences"
            />

            {/* Save Button */}
            <View className="mt-6">
              <Button
                title={t('common.save')}
                onPress={() => handleSubmit(handleSave)}
                loading={isSubmitting}
                icon="checkmark-outline"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
