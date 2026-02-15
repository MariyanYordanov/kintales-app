import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { getUserTrees, getTreeRelatives } from '../../services/tree.service';
import { colors } from '../../constants/colors';
import Button from '../../components/ui/Button';

const STATUS_ICONS = {
  ALIVE: null,
  DECEASED: 'flower-outline',
  MISSING: 'help-circle-outline',
  UNKNOWN: 'help-outline',
};

function getInitials(name) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function formatBirthYear(relative) {
  if (!relative.birthYear) return '';
  let text = String(relative.birthYear);
  if (relative.deathYear) {
    text += ` — ${relative.deathYear}`;
  }
  return text;
}

function RelativeItem({ item, onPress }) {
  const statusIcon = STATUS_ICONS[item.status];

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-4 py-3 bg-surface rounded-2xl mb-2"
      accessibilityRole="button"
      accessibilityLabel={item.fullName}
    >
      {/* Avatar initials */}
      <View className="w-12 h-12 rounded-full bg-primary items-center justify-center mr-3">
        <Text className="font-sans-bold text-base text-white">
          {getInitials(item.fullName)}
        </Text>
      </View>

      {/* Name + dates */}
      <View className="flex-1">
        <Text className="font-sans-semibold text-base text-text-primary">
          {item.fullName}
        </Text>
        {formatBirthYear(item) ? (
          <Text className="font-sans text-sm text-text-muted mt-0.5">
            {formatBirthYear(item)}
          </Text>
        ) : null}
      </View>

      {/* Status icon */}
      {statusIcon ? (
        <Ionicons name={statusIcon} size={18} color={colors.text.muted} />
      ) : null}

      <Ionicons
        name="chevron-forward"
        size={18}
        color={colors.text.muted}
        style={{ marginLeft: 8 }}
      />
    </TouchableOpacity>
  );
}

export default function Tree() {
  const { t } = useTranslation();
  const router = useRouter();
  const [treeId, setTreeId] = useState(null);
  const [relatives, setRelatives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const { data: treesData } = await getUserTrees();
      const trees = treesData.data || [];

      if (trees.length === 0) {
        setIsLoading(false);
        return;
      }

      const tree = trees[0];
      setTreeId(tree.id);

      const { data: relativesData } = await getTreeRelatives(tree.id);
      setRelatives(relativesData.data || []);
    } catch {
      Alert.alert(t('common.error'), t('tree.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  // Reload on screen focus (e.g. after adding a relative)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }, [loadData]);

  const navigateToAddRelative = useCallback(() => {
    if (treeId) {
      router.push({ pathname: '/tree/add-relative', params: { treeId } });
    }
  }, [treeId, router]);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </SafeAreaView>
    );
  }

  // Empty state
  if (relatives.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-6">
            <Ionicons name="people" size={48} color={colors.primary.DEFAULT} />
          </View>

          <Text className="font-sans-bold text-2xl text-text-primary text-center mb-3">
            {t('tree.emptyTitle')}
          </Text>
          <Text className="font-sans text-base text-text-secondary text-center mb-8 leading-6">
            {t('tree.emptySubtitle')}
          </Text>

          <View style={{ width: '100%' }}>
            <Button
              title={t('tree.addFirstRelative')}
              onPress={navigateToAddRelative}
              icon="person-add-outline"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Has relatives
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Text className="font-sans-bold text-3xl text-text-primary">
          {t('tree.title')}
        </Text>
        <Text className="font-sans text-sm text-text-muted mt-1">
          {t('tree.relativesCount', { count: relatives.length })}
        </Text>
      </View>

      {/* Relatives list */}
      <FlatList
        data={relatives}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RelativeItem
            item={item}
            onPress={() => {
              // TODO Phase 2.3: navigate to person/[id]
            }}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.DEFAULT}
            colors={[colors.primary.DEFAULT]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        onPress={navigateToAddRelative}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary items-center justify-center"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 6,
        }}
        accessibilityRole="button"
        accessibilityLabel={t('tree.addRelative')}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
