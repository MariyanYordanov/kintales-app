import { useState, useCallback } from 'react';
import { View, Text, Switch, ScrollView, Alert, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../lib/notifications/notificationContext';
import { colors } from '../../constants/colors';

const NOTIFICATION_TYPES = [
  { icon: 'gift-outline', key: 'typeBirthday' },
  { icon: 'flower-outline', key: 'typeNameDay' },
  { icon: 'candle-outline', key: 'typeCommemoration' },
  { icon: 'heart-outline', key: 'typeMarriage' },
  { icon: 'alert-circle-outline', key: 'typeDeathPending' },
  { icon: 'key-outline', key: 'typeLegacy' },
  { icon: 'calendar-outline', key: 'typeOnThisDay' },
];

export default function NotificationSettings() {
  const { t } = useTranslation();
  const { isEnabled, permissionStatus, enableNotifications, disableNotifications } = useNotifications();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = useCallback(async (value) => {
    if (isToggling) return;
    setIsToggling(true);

    try {
      if (value) {
        const granted = await enableNotifications();
        if (!granted) {
          Alert.alert(
            t('notifications.title'),
            t('notifications.permissionDenied'),
          );
        }
      } else {
        await disableNotifications();
      }
    } catch {
      Alert.alert(t('common.error'), t('notifications.error'));
    } finally {
      setIsToggling(false);
    }
  }, [isToggling, enableNotifications, disableNotifications, t]);

  const handleOpenSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={[]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6 pb-8">
          {/* Header */}
          <View className="items-center mb-6">
            <Ionicons
              name="notifications-outline"
              size={48}
              color={colors.primary.DEFAULT}
            />
            <Text className="font-sans-bold text-xl text-text-primary text-center mt-4">
              {t('notifications.settingsTitle')}
            </Text>
            <Text className="font-sans text-sm text-text-muted text-center mt-1">
              {t('notifications.enableDescription')}
            </Text>
          </View>

          {/* Toggle Card */}
          <View className="bg-surface rounded-2xl p-5 mb-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 mr-4">
                <Ionicons
                  name={isEnabled ? 'notifications' : 'notifications-off-outline'}
                  size={22}
                  color={isEnabled ? colors.primary.DEFAULT : colors.text.muted}
                />
                <Text className="font-sans-semibold text-base text-text-primary ml-3">
                  {t('notifications.enable')}
                </Text>
              </View>
              <Switch
                value={isEnabled}
                onValueChange={handleToggle}
                disabled={isToggling}
                trackColor={{ false: colors.border, true: colors.primary.light }}
                thumbColor={isEnabled ? colors.primary.DEFAULT : colors.text.muted}
                accessibilityRole="switch"
                accessibilityLabel={t('notifications.enable')}
                accessibilityState={{ checked: isEnabled }}
                testID="notifications-toggle"
              />
            </View>
            <Text className="font-sans text-sm text-text-muted mt-2">
              {isEnabled ? t('notifications.enabled') : t('notifications.disabled')}
            </Text>
          </View>

          {/* Permission denied warning */}
          {permissionStatus === 'denied' ? (
            <View
              className="rounded-2xl p-4 mb-4"
              style={{ backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#F59E0B40' }}
            >
              <View className="flex-row items-start">
                <Ionicons
                  name="warning-outline"
                  size={20}
                  color="#D97706"
                  style={{ marginTop: 1 }}
                />
                <View className="flex-1 ml-2">
                  <Text className="font-sans text-sm text-text-secondary">
                    {t('notifications.permissionDenied')}
                  </Text>
                  <Text
                    className="font-sans-semibold text-sm mt-2"
                    style={{ color: '#D97706' }}
                    onPress={handleOpenSettings}
                  >
                    {Platform.OS === 'ios' ? 'Settings → KinTales → Notifications' : 'Open Settings'}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* Notification types info */}
          <View className="bg-surface rounded-2xl p-5">
            <Text className="font-sans-semibold text-sm text-text-primary mb-3">
              {t('notifications.notificationTypes')}
            </Text>
            {NOTIFICATION_TYPES.map((item) => (
              <View key={item.key} className="flex-row items-center mb-2.5">
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={colors.primary.DEFAULT}
                />
                <Text className="font-sans text-sm text-text-secondary ml-3">
                  {t(`notifications.${item.key}`)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
