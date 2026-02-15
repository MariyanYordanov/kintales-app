import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
  ActionSheetIOS,
} from 'react-native';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import { useImagePicker } from '../../hooks/useImagePicker';
import { validateProfileForm } from '../../lib/validators/authValidators';
import { getProfile, updateProfile, uploadAvatar } from '../../services/profile.service';
import Avatar from '../../components/profile/Avatar';
import TextInput from '../../components/ui/TextInput';
import Button from '../../components/ui/Button';
import LanguageSelector from '../../components/ui/LanguageSelector';
import { colors } from '../../constants/colors';

function formatDate(isoString, language) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function Profile() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, setUser, logout } = useAuth();
  const { pickFromCamera, pickFromLibrary } = useImagePicker();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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
      fullName: user?.fullName || '',
      bio: user?.bio || '',
      language: user?.language || 'bg',
    },
    validate: validateProfileForm,
  });

  const refreshProfile = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const { data } = await getProfile();
      const profile = data.data;
      setUser(profile);
      setFieldValue('fullName', profile.fullName || '');
      setFieldValue('bio', profile.bio || '');
      setFieldValue('language', profile.language || 'bg');
    } catch {
      Alert.alert(t('common.error'), t('errors.unknown'));
    } finally {
      setIsRefreshing(false);
    }
  }, [t, setUser, setFieldValue]);

  const handleAvatarUpload = useCallback(
    async (result) => {
      if (!result) return;

      setIsUploadingAvatar(true);
      try {
        const { data } = await uploadAvatar(result.uri);
        setUser(data.data);
      } catch {
        Alert.alert(t('common.error'), t('profile.avatarUploadError'));
      } finally {
        setIsUploadingAvatar(false);
      }
    },
    [t, setUser],
  );

  const handleAvatarPress = useCallback(() => {
    const options = [
      t('profile.takePhoto'),
      t('profile.chooseFromLibrary'),
      t('common.cancel'),
    ];
    const cancelButtonIndex = 2;

    const handleSelection = async (index) => {
      let result = null;
      if (index === 0) {
        result = await pickFromCamera();
      } else if (index === 1) {
        result = await pickFromLibrary();
      }
      await handleAvatarUpload(result);
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex },
        handleSelection,
      );
    } else {
      Alert.alert(t('profile.uploadPhoto'), null, [
        { text: options[0], onPress: () => handleSelection(0) },
        { text: options[1], onPress: () => handleSelection(1) },
        { text: options[2], style: 'cancel' },
      ]);
    }
  }, [t, pickFromCamera, pickFromLibrary, handleAvatarUpload]);

  const handleSaveProfile = useCallback(
    async (formValues) => {
      const changes = {};

      if (formValues.fullName.trim() !== user.fullName) {
        changes.fullName = formValues.fullName.trim();
      }
      if ((formValues.bio || '').trim() !== (user.bio || '')) {
        changes.bio = (formValues.bio || '').trim();
      }
      if (formValues.language !== user.language) {
        changes.language = formValues.language;
      }

      if (Object.keys(changes).length === 0) {
        return;
      }

      try {
        const { data } = await updateProfile(changes);
        setUser(data.data);

        if (changes.language) {
          i18n.changeLanguage(changes.language);
        }

        Alert.alert(t('common.done'), t('profile.saveSuccess'));
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
            Alert.alert(t('common.error'), t('profile.saveError'));
          }
        } else if (!err.response) {
          Alert.alert(t('common.error'), t('errors.network'));
        } else {
          Alert.alert(t('common.error'), t('profile.saveError'));
        }
      }
    },
    [user, setUser, i18n, t, setErrors],
  );

  const handleLogout = useCallback(() => {
    Alert.alert(t('profile.logoutConfirm'), t('profile.logoutConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.logout'),
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  }, [t, logout]);

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
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshProfile}
              tintColor={colors.primary.DEFAULT}
              colors={[colors.primary.DEFAULT]}
            />
          }
        >
          <View className="flex-1 px-6 pt-8 pb-8">
            {/* Screen Title */}
            <Text className="font-sans-bold text-3xl text-text-primary mb-8 text-center">
              {t('profile.title')}
            </Text>

            {/* Avatar Section */}
            <View className="items-center mb-6">
              <Avatar
                source={user?.avatarUrl ? { uri: user.avatarUrl } : null}
                name={user?.fullName}
                size={120}
                onPress={handleAvatarPress}
                showEditBadge
                isUploading={isUploadingAvatar}
                accessibilityLabel={t('profile.uploadPhoto')}
              />
              <Text className="font-sans text-sm text-primary mt-3">
                {t('profile.uploadPhoto')}
              </Text>
            </View>

            {/* User Info (read-only) */}
            <View className="items-center mb-8">
              <Text className="font-sans-bold text-xl text-text-primary">
                {user?.fullName}
              </Text>
              <Text className="font-sans text-base text-text-secondary mt-1">
                {user?.email}
              </Text>
              {user?.createdAt ? (
                <View className="flex-row items-center mt-2">
                  <Ionicons
                    name="calendar-outline"
                    size={14}
                    color={colors.text.muted}
                    style={{ marginRight: 4 }}
                  />
                  <Text className="font-sans text-sm text-text-muted">
                    {t('profile.memberSince')}{' '}
                    {formatDate(user.createdAt, i18n.language)}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Separator */}
            <View className="h-px bg-border mb-6" />

            {/* Edit Form Section */}
            <Text className="font-sans-semibold text-lg text-text-primary mb-4">
              {t('profile.editProfile')}
            </Text>

            <TextInput
              label={t('auth.fullName')}
              value={values.fullName}
              onChangeText={(v) => setFieldValue('fullName', v)}
              onBlur={() => setFieldTouched('fullName')}
              error={errors.fullName ? t(errors.fullName) : null}
              icon="person-outline"
              autoCapitalize="words"
              returnKeyType="next"
            />

            <TextInput
              label={t('profile.bio')}
              value={values.bio}
              onChangeText={(v) => setFieldValue('bio', v)}
              onBlur={() => setFieldTouched('bio')}
              error={errors.bio ? t(errors.bio) : null}
              placeholder={t('profile.bioPlaceholder')}
              icon="document-text-outline"
              multiline
              numberOfLines={4}
              autoCapitalize="sentences"
            />

            <LanguageSelector
              label={t('profile.language')}
              value={values.language}
              onChange={(lang) => setFieldValue('language', lang)}
            />

            {/* Save Button */}
            <View className="mt-2 mb-4">
              <Button
                title={t('common.save')}
                onPress={() => handleSubmit(handleSaveProfile)}
                loading={isSubmitting}
                icon="checkmark-outline"
              />
            </View>

            {/* Separator */}
            <View className="h-px bg-border my-6" />

            {/* Settings Section */}
            <TouchableOpacity
              onPress={() => router.push('/settings/guardians')}
              className="flex-row items-center bg-surface rounded-2xl p-4 mb-3"
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('settings.guardians')}
            >
              <Ionicons name="shield-outline" size={22} color={colors.text.primary} />
              <Text className="font-sans-medium text-base text-text-primary flex-1 ml-3">
                {t('settings.guardians')}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/settings/legacy-key')}
              className="flex-row items-center bg-surface rounded-2xl p-4 mb-3"
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('settings.legacyKey')}
            >
              <Ionicons name="key-outline" size={22} color={colors.text.primary} />
              <Text className="font-sans-medium text-base text-text-primary flex-1 ml-3">
                {t('settings.legacyKey')}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/settings/export-data')}
              className="flex-row items-center bg-surface rounded-2xl p-4 mb-3"
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('settings.exportData')}
            >
              <Ionicons name="download-outline" size={22} color={colors.text.primary} />
              <Text className="font-sans-medium text-base text-text-primary flex-1 ml-3">
                {t('settings.exportData')}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/settings/privacy')}
              className="flex-row items-center bg-surface rounded-2xl p-4 mb-3"
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('settings.privacy')}
            >
              <Ionicons name="lock-closed-outline" size={22} color={colors.text.primary} />
              <Text className="font-sans-medium text-base text-text-primary flex-1 ml-3">
                {t('settings.privacy')}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
            </TouchableOpacity>

            {/* Separator */}
            <View className="h-px bg-border my-3" />

            <TouchableOpacity
              onPress={() => router.push('/settings/delete-account')}
              className="flex-row items-center bg-surface rounded-2xl p-4 mb-6"
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('settings.deleteAccount')}
            >
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
              <Text className="font-sans-medium text-base flex-1 ml-3" style={{ color: '#EF4444' }}>
                {t('settings.deleteAccount')}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
            </TouchableOpacity>

            {/* Logout Button */}
            <Button
              title={t('auth.logout')}
              onPress={handleLogout}
              variant="outline"
              icon="log-out-outline"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
