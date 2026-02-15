import { useState, useEffect, useCallback, useMemo } from 'react';
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
import * as Haptics from 'expo-haptics';
import { useForm } from '../../hooks/useForm';
import { validateAddRelativeForm } from '../../lib/validators/relativeValidators';
import { createRelative } from '../../services/relatives.service';
import { createRelationship } from '../../services/relationships.service';
import { getTreeRelatives } from '../../services/tree.service';
import { DEFAULT_STATUS } from '../../constants/relationships';
import TextInput from '../../components/ui/TextInput';
import Button from '../../components/ui/Button';
import PartialDatePicker from '../../components/ui/PartialDatePicker';
import StatusSelector from '../../components/ui/StatusSelector';
import RelationshipTypeSelector from '../../components/ui/RelationshipTypeSelector';
import PersonPicker from '../../components/ui/PersonPicker';
import { colors } from '../../constants/colors';

function buildRelativePayload(values, treeId) {
  const payload = { treeId, fullName: values.fullName.trim() };

  if (values.birthYear != null) payload.birthYear = values.birthYear;
  if (values.birthMonth != null) payload.birthMonth = values.birthMonth;
  if (values.birthDay != null) payload.birthDay = values.birthDay;
  if (values.deathYear != null) payload.deathYear = values.deathYear;
  if (values.deathMonth != null) payload.deathMonth = values.deathMonth;
  if (values.deathDay != null) payload.deathDay = values.deathDay;

  const bio = (values.bio || '').trim();
  if (bio) payload.bio = bio;

  if (values.status !== DEFAULT_STATUS) payload.status = values.status;

  return payload;
}

function buildRelationshipPayload(values, treeId, newRelativeId) {
  const payload = {
    treeId,
    personAId: newRelativeId,
    personBId: values.relatedPersonId,
    relationshipType: values.relationshipType,
  };

  if (values.relationshipType === 'spouse') {
    if (values.marriageYear != null) payload.marriageYear = values.marriageYear;
    if (values.marriageMonth != null) payload.marriageMonth = values.marriageMonth;
    if (values.marriageDay != null) payload.marriageDay = values.marriageDay;
    if (values.divorceYear != null) payload.divorceYear = values.divorceYear;
    if (values.divorceMonth != null) payload.divorceMonth = values.divorceMonth;
    if (values.divorceDay != null) payload.divorceDay = values.divorceDay;
  }

  return payload;
}

export default function AddRelative() {
  const { t } = useTranslation();
  const router = useRouter();
  const { treeId } = useLocalSearchParams();
  const [relatives, setRelatives] = useState([]);
  const [isLoadingRelatives, setIsLoadingRelatives] = useState(true);

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
      relationshipType: null,
      relatedPersonId: null,
      marriageYear: null,
      marriageMonth: null,
      marriageDay: null,
      divorceYear: null,
      divorceMonth: null,
      divorceDay: null,
    },
    validate: validateAddRelativeForm,
  });

  // Load existing relatives for PersonPicker
  useEffect(() => {
    if (!treeId) return;

    let cancelled = false;
    (async () => {
      try {
        const { data } = await getTreeRelatives(treeId);
        if (!cancelled) setRelatives(data.data || []);
      } catch {
        // Non-critical — PersonPicker will show empty
      } finally {
        if (!cancelled) setIsLoadingRelatives(false);
      }
    })();

    return () => { cancelled = true; };
  }, [treeId]);

  const hasRelatives = relatives.length > 0;
  const isSpouse = values.relationshipType === 'spouse';
  const isDeceased = values.status === 'DECEASED';

  // Conditional field clearing
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

  const handleRelationshipTypeChange = useCallback(
    (newType) => {
      setFieldValue('relationshipType', newType);
      if (newType == null) {
        setFieldValue('relatedPersonId', null);
      }
      if (newType !== 'spouse') {
        setFieldValue('marriageYear', null);
        setFieldValue('marriageMonth', null);
        setFieldValue('marriageDay', null);
        setFieldValue('divorceYear', null);
        setFieldValue('divorceMonth', null);
        setFieldValue('divorceDay', null);
      }
    },
    [setFieldValue],
  );

  const handleSave = useCallback(
    async (formValues) => {
      try {
        // Step 1: Create relative
        const { data: relData } = await createRelative(
          buildRelativePayload(formValues, treeId),
        );
        const newRelative = relData.data;

        // Step 2: Create relationship (if set)
        if (formValues.relationshipType && formValues.relatedPersonId) {
          try {
            await createRelationship(
              buildRelationshipPayload(formValues, treeId, newRelative.id),
            );
          } catch (relErr) {
            // Relative was created but relationship failed — warn user
            Alert.alert(
              t('common.done'),
              t('relative.saveSuccess') + '\n' + t('relationship.createError'),
            );
            router.back();
            return;
          }
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(t('common.done'), t('relative.saveSuccess'));
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
            Alert.alert(t('common.error'), t('relative.saveError'));
          }
        } else if (!err.response) {
          Alert.alert(t('common.error'), t('errors.network'));
        } else {
          Alert.alert(t('common.error'), t('relative.saveError'));
        }
      }
    },
    [treeId, t, setErrors, router],
  );

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
            {t('relative.formTitle')}
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
              testID="add-relative-name-input"
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

            {/* Relationship Section */}
            {hasRelatives ? (
              <>
                <View className="h-px bg-border my-4" />

                <Text className="font-sans-semibold text-lg text-text-primary mb-1">
                  {t('relationship.title')}
                </Text>
                <Text className="font-sans text-sm text-text-muted mb-4">
                  {t('relationship.optional')}
                </Text>

                <RelationshipTypeSelector
                  label={t('relationship.type')}
                  value={values.relationshipType}
                  onChange={handleRelationshipTypeChange}
                  error={errors.relationshipType ? t(errors.relationshipType) : null}
                />

                {values.relationshipType ? (
                  <>
                    {isLoadingRelatives ? (
                      <ActivityIndicator
                        color={colors.primary.DEFAULT}
                        style={{ marginVertical: 16 }}
                      />
                    ) : (
                      <PersonPicker
                        label={t('relationship.relatedPerson')}
                        relatives={relatives}
                        value={values.relatedPersonId}
                        onChange={(id) => setFieldValue('relatedPersonId', id)}
                        error={errors.relatedPersonId ? t(errors.relatedPersonId) : null}
                      />
                    )}

                    {/* Marriage/Divorce dates for spouse */}
                    {isSpouse ? (
                      <>
                        <PartialDatePicker
                          label={t('relationship.marriageDate')}
                          year={values.marriageYear}
                          month={values.marriageMonth}
                          day={values.marriageDay}
                          onChangeYear={(v) => setFieldValue('marriageYear', v)}
                          onChangeMonth={(v) => setFieldValue('marriageMonth', v)}
                          onChangeDay={(v) => setFieldValue('marriageDay', v)}
                          onBlur={() => setFieldTouched('marriageDate')}
                          error={errors.marriageDate ? t(errors.marriageDate) : null}
                        />
                        <PartialDatePicker
                          label={t('relationship.divorceDate')}
                          year={values.divorceYear}
                          month={values.divorceMonth}
                          day={values.divorceDay}
                          onChangeYear={(v) => setFieldValue('divorceYear', v)}
                          onChangeMonth={(v) => setFieldValue('divorceMonth', v)}
                          onChangeDay={(v) => setFieldValue('divorceDay', v)}
                          onBlur={() => setFieldTouched('divorceDate')}
                          error={errors.divorceDate ? t(errors.divorceDate) : null}
                        />
                      </>
                    ) : null}
                  </>
                ) : null}
              </>
            ) : null}

            {/* Save Button */}
            <View className="mt-6">
              <Button
                title={t('common.save')}
                onPress={() => handleSubmit(handleSave)}
                loading={isSubmitting}
                icon="checkmark-outline"
                testID="add-relative-save-button"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
