import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm } from '../../hooks/useForm';
import { validateForgotPasswordForm } from '../../lib/validators/authValidators';
import { forgotPassword } from '../../services/auth.service';
import TextInput from '../../components/ui/TextInput';
import Button from '../../components/ui/Button';
import { colors } from '../../constants/colors';

function SuccessView({ t, onBackToLogin }) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="w-20 h-20 rounded-full bg-success/10 items-center justify-center mb-6">
        <Ionicons name="checkmark-circle" size={48} color={colors.success} />
      </View>
      <Text className="font-sans-bold text-2xl text-text-primary text-center mb-3">
        {t('auth.resetEmailSent')}
      </Text>
      <Text className="font-sans text-base text-text-secondary text-center mb-8">
        {t('auth.forgotPasswordSubtitle')}
      </Text>
      <Button
        title={t('auth.backToLogin')}
        onPress={onBackToLogin}
        variant="primary"
      />
    </View>
  );
}

export default function ForgotPassword() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isSent, setIsSent] = useState(false);

  const { values, errors, setFieldValue, setFieldTouched, handleSubmit, isSubmitting } =
    useForm({
      initialValues: { email: '' },
      validate: validateForgotPasswordForm,
    });

  const onSubmit = async (formValues) => {
    try {
      await forgotPassword(formValues.email);
      setIsSent(true);
    } catch (err) {
      const status = err.response?.status;

      if (status === 429) {
        Alert.alert(t('common.error'), t('auth.errors.tooManyAttempts'));
      } else if (!err.response) {
        Alert.alert(t('common.error'), t('errors.network'));
      } else {
        Alert.alert(t('common.error'), t('errors.unknown'));
      }
    }
  };

  const goToLogin = () => router.push('/(auth)/login');

  if (isSent) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        <SuccessView t={t} onBackToLogin={goToLogin} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-4 pb-8">
            {/* Back Button */}
            <TouchableOpacity
              onPress={goToLogin}
              className="flex-row items-center py-3"
              style={{ minHeight: 48 }}
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
              <Text className="font-sans-medium text-base text-text-primary ml-2">
                {t('common.back')}
              </Text>
            </TouchableOpacity>

            {/* Header */}
            <View className="items-center mt-8 mb-10">
              <View className="w-20 h-20 rounded-full bg-primary-light items-center justify-center mb-4">
                <Ionicons name="lock-closed" size={36} color={colors.primary.DEFAULT} />
              </View>
              <Text className="font-sans-bold text-3xl text-text-primary mb-2">
                {t('auth.forgotPassword')}
              </Text>
              <Text className="font-sans text-base text-text-secondary text-center">
                {t('auth.forgotPasswordSubtitle')}
              </Text>
            </View>

            {/* Form */}
            <TextInput
              label={t('auth.email')}
              value={values.email}
              onChangeText={(v) => setFieldValue('email', v)}
              onBlur={() => setFieldTouched('email')}
              error={errors.email ? t(errors.email) : null}
              placeholder="name@example.com"
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="done"
              onSubmitEditing={() => handleSubmit(onSubmit)}
            />

            <View className="mt-4">
              <Button
                title={t('auth.sendResetLink')}
                onPress={() => handleSubmit(onSubmit)}
                loading={isSubmitting}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
