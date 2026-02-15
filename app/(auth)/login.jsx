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
import { validateLoginForm } from '../../lib/validators/authValidators';
import TextInput from '../../components/ui/TextInput';
import Button from '../../components/ui/Button';
import GoogleButton from '../../components/ui/GoogleButton';
import { colors } from '../../constants/colors';

export default function Login() {
  const { t } = useTranslation();
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef(null);

  const { values, errors, setFieldValue, setFieldTouched, handleSubmit, isSubmitting } =
    useForm({
      initialValues: { email: '', password: '' },
      validate: validateLoginForm,
    });

  const onLogin = async (formValues) => {
    try {
      await login(formValues);
      router.replace('/(tabs)');
    } catch (err) {
      const status = err.response?.status;

      if (status === 401) {
        Alert.alert(t('common.error'), t('auth.errors.invalidCredentials'));
      } else if (status === 429) {
        Alert.alert(t('common.error'), t('auth.errors.tooManyAttempts'));
      } else if (!err.response) {
        Alert.alert(t('common.error'), t('errors.network'));
      } else {
        Alert.alert(t('common.error'), t('errors.unknown'));
      }
    }
  };

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
          <View className="flex-1 px-6 pt-12 pb-8">
            {/* Header */}
            <View className="items-center mb-10">
              <View className="w-20 h-20 rounded-full bg-primary-light items-center justify-center mb-4">
                <Ionicons name="heart" size={36} color={colors.primary.DEFAULT} />
              </View>
              <Text className="font-sans-bold text-3xl text-text-primary mb-2">
                {t('app.name')}
              </Text>
              <Text className="font-sans text-base text-text-secondary">
                {t('auth.loginSubtitle')}
              </Text>
            </View>

            {/* Form */}
            <View className="mb-2">
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
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                testID="login-email-input"
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
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={() => handleSubmit(onLogin)}
                testID="login-password-input"
              />
            </View>

            {/* Forgot Password */}
            <View className="items-end mb-6">
              <Button
                title={t('auth.forgotPassword')}
                onPress={() => router.push('/(auth)/forgot-password')}
                variant="text"
                size="md"
              />
            </View>

            {/* Login Button */}
            <Button
              title={t('auth.login')}
              onPress={() => handleSubmit(onLogin)}
              loading={isSubmitting}
              testID="login-submit-button"
            />

            {/* Separator */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-border" />
              <Text className="font-sans text-sm text-text-muted mx-4">
                {t('auth.or')}
              </Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* Google Button */}
            <GoogleButton />

            {/* Register Link */}
            <View className="flex-row items-center justify-center mt-8">
              <Text className="font-sans text-base text-text-secondary">
                {t('auth.noAccount')}{' '}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/register')}
                accessibilityRole="link"
                testID="login-register-link"
              >
                <Text className="font-sans-bold text-base text-primary">
                  {t('auth.register')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
