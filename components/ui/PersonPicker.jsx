import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../constants/colors';

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

function RelativeRow({ item, isSelected, onPress }) {
  return (
    <TouchableOpacity
      onPress={() => onPress(item.id)}
      className={`flex-row items-center px-4 py-3 border-b border-border ${
        isSelected ? 'bg-primary/10' : ''
      }`}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={item.fullName}
    >
      {/* Mini avatar */}
      <View
        className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-3"
      >
        <Text className="font-sans-semibold text-sm text-white">
          {getInitials(item.fullName)}
        </Text>
      </View>

      {/* Name + year */}
      <View className="flex-1">
        <Text className="font-sans-semibold text-base text-text-primary">
          {item.fullName}
        </Text>
        {item.birthYear ? (
          <Text className="font-sans text-sm text-text-muted">
            {item.birthYear}
          </Text>
        ) : null}
      </View>

      {isSelected ? (
        <Ionicons name="checkmark-circle" size={24} color={colors.primary.DEFAULT} />
      ) : null}
    </TouchableOpacity>
  );
}

export default function PersonPicker({
  relatives,
  value,
  onChange,
  label,
  error,
  placeholder,
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedPerson = useMemo(
    () => relatives.find((r) => r.id === value),
    [relatives, value],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return relatives;
    const lower = search.toLowerCase();
    return relatives.filter((r) => r.fullName.toLowerCase().includes(lower));
  }, [relatives, search]);

  const handleSelect = useCallback(
    (id) => {
      onChange(id);
      setIsOpen(false);
      setSearch('');
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange(null);
    setIsOpen(false);
    setSearch('');
  }, [onChange]);

  // No relatives — show info text
  if (relatives.length === 0) {
    return (
      <View className="mb-4">
        {label ? (
          <Text className="font-sans-medium text-sm text-text-secondary mb-1.5 ml-1">
            {label}
          </Text>
        ) : null}
        <Text className="font-sans text-sm text-text-muted ml-1">
          {t('relationship.noRelatives')}
        </Text>
      </View>
    );
  }

  const borderClass = error ? 'border-error' : 'border-border';

  return (
    <View className="mb-4">
      {label ? (
        <Text className="font-sans-medium text-sm text-text-secondary mb-1.5 ml-1">
          {label}
        </Text>
      ) : null}

      {/* Trigger button */}
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className={`flex-row items-center bg-surface rounded-2xl border px-4 ${borderClass}`}
        style={{ minHeight: 56 }}
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
      >
        <Ionicons
          name="people-outline"
          size={20}
          color={selectedPerson ? colors.primary.DEFAULT : colors.text.muted}
          style={{ marginRight: 12 }}
        />
        <Text
          className={`font-sans text-base flex-1 ${
            selectedPerson ? 'text-text-primary' : 'text-text-muted'
          }`}
        >
          {selectedPerson
            ? selectedPerson.fullName
            : placeholder || t('relationship.relatedPersonPlaceholder')}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={colors.text.muted}
        />
      </TouchableOpacity>

      {error ? (
        <Text
          className="font-sans text-sm text-error mt-1 ml-1"
          accessibilityRole="alert"
        >
          {error}
        </Text>
      ) : null}

      {/* Selection Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setIsOpen(false);
          setSearch('');
        }}
      >
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
            <TouchableOpacity
              onPress={() => {
                setIsOpen(false);
                setSearch('');
              }}
              className="p-2"
              accessibilityLabel={t('common.cancel')}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>

            <Text className="font-sans-semibold text-lg text-text-primary">
              {label || t('relationship.relatedPerson')}
            </Text>

            <View style={{ width: 40 }} />
          </View>

          {/* Search */}
          <View className="px-4 py-3">
            <View className="flex-row items-center bg-surface rounded-xl border border-border px-3">
              <Ionicons
                name="search"
                size={18}
                color={colors.text.muted}
                style={{ marginRight: 8 }}
              />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={t('relationship.searchPlaceholder')}
                placeholderTextColor={colors.text.muted}
                className="font-sans text-base text-text-primary flex-1 py-3"
                autoFocus
              />
            </View>
          </View>

          {/* "None" option */}
          <TouchableOpacity
            onPress={handleClear}
            className={`flex-row items-center px-4 py-3 border-b border-border ${
              value == null ? 'bg-primary/10' : ''
            }`}
            accessibilityRole="radio"
            accessibilityState={{ selected: value == null }}
          >
            <View className="w-10 h-10 rounded-full bg-surface-secondary items-center justify-center mr-3">
              <Ionicons name="remove-circle-outline" size={20} color={colors.text.muted} />
            </View>
            <Text className="font-sans text-base text-text-secondary flex-1">
              {t('relationship.selectNone')}
            </Text>
            {value == null ? (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary.DEFAULT} />
            ) : null}
          </TouchableOpacity>

          {/* Relatives list */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RelativeRow
                item={item}
                isSelected={value === item.id}
                onPress={handleSelect}
              />
            )}
            ListEmptyComponent={
              <View className="items-center py-8">
                <Text className="font-sans text-base text-text-muted">
                  {t('common.noData')}
                </Text>
              </View>
            }
            keyboardShouldPersistTaps="handled"
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}
