import { useState, useRef } from 'react';
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
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import {
  validateRegisterForm,
  validatePassword,
} from '../../lib/validators/authValidators';
import TextInput from '../../components/ui/TextInput';
import Button from '../../components/ui/Button';
import LanguageSelector from '../../components/ui/LanguageSelector';
import { colors } from '../../constants/colors';

const PASSWORD_CHECKS = [
  { key: 'minLength', label: 'auth.passwordRequirements.minLength' },
  { key: 'hasUppercase', label: 'auth.passwordRequirements.uppercase' },
  { key: 'hasLowercase', label: 'auth.passwordRequirements.lowercase' },
  { key: 'hasDigit', label: 'auth.passwordRequirements.digit' },
];

function PasswordRequirements({ password, t }) {
  const { checks } = validatePassword(password);

  return (
    <View className="flex-row flex-wrap mb-4 -mt-2 px-1">
      {PASSWORD_CHECKS.map((check) => {
        const met = checks[check.key];
        return (
          <View key={check.key} className="flex-row items-center w-1/2 mb-1.5">
            <Ionicons
              name={met ? 'checkmark-circle' : 'ellipse-outline'}
              size={16}
              color={met ? colors.success : colors.text.muted}
            />
            <Text
              className={`font-sans text-xs ml-1.5 ${met ? 'text-success' : 'text-text-muted'}`}
            >
              {t(check.label)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function Register() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  const {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    handleSubmit,
    setErrors,
    isSubmitting,
  } = useForm({
    initialValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      language: i18n.language === 'bg' ? 'bg' : 'en',
    },
    validate: validateRegisterForm,
  });

  const onRegister = async (formValues) => {
    try {
      const { confirmPassword, ...registerData } = formValues;
      await register(registerData);
      router.replace('/(tabs)');
    } catch (err) {
      const status = err.response?.status;

      if (status === 409) {
        setErrors({ email: t('auth.errors.emailExists') });
      } else if (status === 422) {
        const serverErrors = err.response.data?.errors;
        if (Array.isArray(serverErrors)) {
          const mapped = {};
          for (const e of serverErrors) {
            if (e.field) mapped[e.field] = e.message;
          }
          setErrors(mapped);
        }
      } else if (status === 429) {
        Alert.alert(t('common.error'), t('auth.errors.tooManyAttempts'));
      } else if (!err.response) {
        Alert.alert(t('common.error'), t('errors.network'));
      } else {
        Alert.alert(t('common.error'), t('errors.unknown'));
      }
    }
  };

  const showPasswordChecks = touched.password || values.password.length > 0;

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
          <View className="flex-1 px-6 pt-8 pb-8">
            {/* Header */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 rounded-full bg-primary-light items-center justify-center mb-4">
                <Ionicons name="person-add" size={36} color={colors.primary.DEFAULT} />
              </View>
              <Text className="font-sans-bold text-3xl text-text-primary mb-2">
                {t('auth.register')}
              </Text>
              <Text className="font-sans text-base text-text-secondary">
                {t('auth.registerSubtitle')}
              </Text>
            </View>

            {/* Form */}
            <TextInput
              label={t('auth.fullName')}
              value={values.fullName}
              onChangeText={(v) => setFieldValue('fullName', v)}
              onBlur={() => setFieldTouched('fullName')}
              error={errors.fullName ? t(errors.fullName) : null}
              placeholder={t('auth.fullName')}
              icon="person-outline"
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              testID="register-fullname-input"
            />

            <TextInput
              ref={emailRef}
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
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              testID="register-email-input"
            />

            <TextInput
              ref={passwordRef}
              label={t('auth.password')}
              value={values.password}
              onChangeText={(v) => setFieldValue('password', v)}
              onBlur={() => setFieldTouched('password')}
              error={errors.password ? t(errors.password) : null}
              placeholder="********"
              icon="lock-closed-outline"
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword((prev) => !prev)}
              autoCapitalize="none"
              autoComplete="new-password"
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              testID="register-password-input"
            />

            {showPasswordChecks ? (
              <PasswordRequirements password={values.password} t={t} />
            ) : null}

            <TextInput
              ref={confirmRef}
              label={t('auth.confirmPassword')}
              value={values.confirmPassword}
              onChangeText={(v) => setFieldValue('confirmPassword', v)}
              onBlur={() => setFieldTouched('confirmPassword')}
              error={errors.confirmPassword ? t(errors.confirmPassword) : null}
              placeholder="********"
              icon="lock-closed-outline"
              secureTextEntry={!showConfirm}
              rightIcon={showConfirm ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowConfirm((prev) => !prev)}
              autoCapitalize="none"
              autoComplete="new-password"
              returnKeyType="done"
              onSubmitEditing={() => handleSubmit(onRegister)}
              testID="register-confirm-password-input"
            />

            <LanguageSelector
              label={t('auth.preferredLanguage')}
              value={values.language}
              onChange={(lang) => setFieldValue('language', lang)}
            />

            {/* Register Button */}
            <View className="mt-2">
              <Button
                title={t('auth.register')}
                onPress={() => handleSubmit(onRegister)}
                loading={isSubmitting}
                testID="register-submit-button"
              />
            </View>

            {/* Login Link */}
            <View className="flex-row items-center justify-center mt-6">
              <Text className="font-sans text-base text-text-secondary">
                {t('auth.hasAccount')}{' '}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/login')}
                accessibilityRole="link"
              >
                <Text className="font-sans-bold text-base text-primary">
                  {t('auth.login')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
