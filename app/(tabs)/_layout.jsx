import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#A8A29E',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E7E5E4',
          height: 88,
          paddingBottom: 28,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'PlusJakartaSans_500Medium',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: t('tabs.home'),
        }}
      />
      <Tabs.Screen
        name="tree"
        options={{
          title: t('tabs.tree'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="git-network-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: t('tabs.tree'),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: t('tabs.feed'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: t('tabs.feed'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: t('tabs.profile'),
        }}
      />
    </Tabs>
  );
}
