import { FlatList, View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

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
      <View className="w-12 h-12 rounded-full bg-primary items-center justify-center mr-3">
        <Text className="font-sans-bold text-base text-white">
          {getInitials(item.fullName)}
        </Text>
      </View>

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

export default function RelativesList({ relatives, onPressItem, isRefreshing, onRefresh }) {
  return (
    <FlatList
      data={relatives}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <RelativeItem
          item={item}
          onPress={() => onPressItem(item)}
        />
      )}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary.DEFAULT}
          colors={[colors.primary.DEFAULT]}
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
}
