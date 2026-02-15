import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { getUserTrees } from '../../services/tree.service';
import { getTreeGuardians, addGuardian, removeGuardian } from '../../services/guardian.service';
import GuardianCard from '../../components/legacy/GuardianCard';
import TextInput from '../../components/ui/TextInput';
import Button from '../../components/ui/Button';
import { colors } from '../../constants/colors';

export default function Guardians() {
  const { t } = useTranslation();

  const [guardians, setGuardians] = useState([]);
  const [treeId, setTreeId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState('FULL');
  const [isAdding, setIsAdding] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const { data: treesData } = await getUserTrees();
      const trees = treesData.data || [];

      if (trees.length === 0) {
        setTreeId(null);
        setGuardians([]);
        return;
      }

      const tree = trees[0];
      setTreeId(tree.id);

      const { data: guardiansData } = await getTreeGuardians(tree.id);
      setGuardians(guardiansData.data || []);
    } catch (err) {
      console.error('Failed to load guardians:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadData();
    }, [loadData]),
  );

  const handleAdd = useCallback(async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedEmail || !trimmedName) {
      Alert.alert(t('common.error'), t('validation.emailRequired'));
      return;
    }

    setIsAdding(true);
    try {
      await addGuardian({
        treeId,
        guardianEmail: trimmedEmail,
        guardianName: trimmedName,
        permissions,
      });

      Alert.alert(t('common.done'), t('guardians.addSuccess'));
      setEmail('');
      setName('');
      setPermissions('FULL');
      setShowAddForm(false);

      const { data: guardiansData } = await getTreeGuardians(treeId);
      setGuardians(guardiansData.data || []);
    } catch (err) {
      const status = err.response?.status;
      if (status === 400) {
        Alert.alert(t('common.error'), t('guardians.limitReached'));
      } else if (status === 409) {
        Alert.alert(t('common.error'), t('guardians.emailExists'));
      } else {
        Alert.alert(t('common.error'), t('errors.unknown'));
      }
    } finally {
      setIsAdding(false);
    }
  }, [treeId, email, name, permissions, t]);

  const handleRemove = useCallback((guardian) => {
    Alert.alert(
      t('guardians.removeConfirm'),
      t('guardians.removeConfirmMessage', { name: guardian.guardianName }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await removeGuardian(guardian.id);
              setGuardians((prev) => prev.filter((g) => g.id !== guardian.id));
            } catch {
              Alert.alert(t('common.error'), t('errors.unknown'));
            }
          },
        },
      ],
    );
  }, [t]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View className="flex-1 items-center justify-center px-8 py-16">
        <Ionicons name="shield-outline" size={48} color={colors.text.muted} />
        <Text className="font-sans-semibold text-lg text-text-primary text-center mt-4">
          {t('guardians.emptyTitle')}
        </Text>
        <Text className="font-sans text-sm text-text-muted text-center mt-2">
          {t('guardians.emptySubtitle')}
        </Text>
      </View>
    );
  }, [isLoading, t]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={[]}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-8" edges={[]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.text.muted} />
        <Text className="font-sans-medium text-base text-text-secondary text-center mt-4 mb-6">
          {t('errors.unknown')}
        </Text>
        <Button
          title={t('common.retry')}
          onPress={() => { setIsLoading(true); loadData(); }}
          variant="outline"
          icon="refresh-outline"
        />
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <FlatList
        data={guardians}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GuardianCard guardian={item} onRemove={handleRemove} />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text className="font-sans text-sm text-text-muted mb-4">
            {t('guardians.subtitle')}
          </Text>
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          <View className="mt-4">
            {!showAddForm ? (
              <Button
                title={t('guardians.addGuardian')}
                onPress={() => setShowAddForm(true)}
                icon="add-outline"
                variant="outline"
              />
            ) : (
              <View className="bg-surface rounded-2xl p-4">
                <TextInput
                  label={t('guardians.emailLabel')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  icon="mail-outline"
                />
                <TextInput
                  label={t('guardians.nameLabel')}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  icon="person-outline"
                />

                {/* Permissions toggle */}
                <Text className="font-sans-medium text-sm text-text-secondary mb-2">
                  {t('guardians.permissionsLabel')}
                </Text>
                <View className="flex-row mb-4" style={{ gap: 8 }}>
                  {['FULL', 'VIEW_ONLY'].map((perm) => (
                    <Button
                      key={perm}
                      title={perm === 'FULL' ? t('guardians.permissionFull') : t('guardians.permissionViewOnly')}
                      onPress={() => setPermissions(perm)}
                      variant={permissions === perm ? 'primary' : 'outline'}
                      size="md"
                    />
                  ))}
                </View>

                <View className="flex-row" style={{ gap: 8 }}>
                  <View className="flex-1">
                    <Button
                      title={t('common.cancel')}
                      onPress={() => {
                        setShowAddForm(false);
                        setEmail('');
                        setName('');
                        setPermissions('FULL');
                      }}
                      variant="outline"
                    />
                  </View>
                  <View className="flex-1">
                    <Button
                      title={t('guardians.addGuardian')}
                      onPress={handleAdd}
                      loading={isAdding}
                      icon="add-outline"
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}
