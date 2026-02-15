import { useState, useCallback, useRef, useEffect } from 'react';
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
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import QRCode from 'react-native-qrcode-svg';
import { getUserTrees } from '../../services/tree.service';
import { getTreeLegacyKeys, createLegacyKey, revokeLegacyKey } from '../../services/legacy.service';
import LegacyKeyCard from '../../components/legacy/LegacyKeyCard';
import { buildQRPrintHTML } from '../../components/legacy/QRPrintTemplate';
import TextInput from '../../components/ui/TextInput';
import Button from '../../components/ui/Button';
import { colors } from '../../constants/colors';

export default function LegacyKey() {
  const { t } = useTranslation();
  const qrRef = useRef(null);

  const [legacyKeys, setLegacyKeys] = useState([]);
  const [treeId, setTreeId] = useState(null);
  const [treeName, setTreeName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate form state
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [keyType, setKeyType] = useState('QR_CODE');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const { data: treesData } = await getUserTrees();
      const trees = treesData.data || [];

      if (trees.length === 0) {
        setTreeId(null);
        setLegacyKeys([]);
        return;
      }

      const tree = trees[0];
      setTreeId(tree.id);
      setTreeName(tree.name || '');

      const { data: keysData } = await getTreeLegacyKeys(tree.id);
      setLegacyKeys(keysData.data || []);
    } catch (err) {
      console.error('Failed to load legacy keys:', err);
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

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const payload = { treeId, keyType };
      const trimmedEmail = recipientEmail.trim().toLowerCase();
      const trimmedName = recipientName.trim();

      if (trimmedEmail) payload.recipientEmail = trimmedEmail;
      if (trimmedName) payload.recipientName = trimmedName;

      await createLegacyKey(payload);

      setRecipientEmail('');
      setRecipientName('');
      setShowGenerateForm(false);

      const { data: keysData } = await getTreeLegacyKeys(treeId);
      setLegacyKeys(keysData.data || []);
    } catch {
      Alert.alert(t('common.error'), t('errors.unknown'));
    } finally {
      setIsGenerating(false);
    }
  }, [treeId, keyType, recipientEmail, recipientName, t]);

  const handleCopy = useCallback(async (keyCode) => {
    await Clipboard.setStringAsync(keyCode);
    Alert.alert(t('common.done'), t('legacy.copySuccess'));
  }, [t]);

  const handlePrint = useCallback(async (key) => {
    try {
      // Generate QR as base64 data URI (small delay ensures QR component has rendered)
      const qrDataUri = await new Promise((resolve) => {
        const tryResolve = () => {
          if (qrRef.current) {
            qrRef.current.toDataURL((data) => resolve(`data:image/png;base64,${data}`));
          } else {
            resolve('');
          }
        };
        setTimeout(tryResolve, 150);
      });

      let html = buildQRPrintHTML(key.keyCode, treeName);

      // Inject QR image into HTML
      if (qrDataUri) {
        html = html.replace(
          '<img id="qr-img" width="200" height="200" />',
          `<img src="${qrDataUri}" width="200" height="200" alt="QR Code" />`,
        );
      }

      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
      } else {
        await Print.printAsync({ html });
      }
    } catch (err) {
      console.error('Print failed:', err);
      // Fallback: just print without QR image
      try {
        const html = buildQRPrintHTML(key.keyCode, treeName);
        await Print.printAsync({ html });
      } catch {
        Alert.alert(t('common.error'), t('errors.unknown'));
      }
    }
  }, [treeName, t]);

  const handleRevoke = useCallback((key) => {
    Alert.alert(
      t('legacy.revokeConfirm'),
      t('legacy.revokeConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await revokeLegacyKey(key.id);
              setLegacyKeys((prev) =>
                prev.map((k) => (k.id === key.id ? { ...k, status: 'REVOKED' } : k)),
              );
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
        <Ionicons name="key-outline" size={48} color={colors.text.muted} />
        <Text className="font-sans-semibold text-lg text-text-primary text-center mt-4">
          {t('legacy.emptyTitle')}
        </Text>
        <Text className="font-sans text-sm text-text-muted text-center mt-2">
          {t('legacy.emptySubtitle')}
        </Text>
      </View>
    );
  }, [isLoading, t]);

  // Hidden QR for export - renders the first ACTIVE key
  const activeKey = legacyKeys.find((k) => k.status === 'ACTIVE');

  // Clean up QR ref when active key changes or component unmounts
  useEffect(() => {
    return () => { qrRef.current = null; };
  }, [activeKey?.keyCode]);

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
      {/* Hidden QR code for PDF export */}
      {activeKey ? (
        <View style={{ position: 'absolute', left: -9999 }}>
          <QRCode
            value={activeKey.keyCode}
            size={200}
            getRef={(ref) => { qrRef.current = ref; }}
          />
        </View>
      ) : null}

      <FlatList
        data={legacyKeys}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LegacyKeyCard
            legacyKey={item}
            onCopy={handleCopy}
            onRevoke={handleRevoke}
            onPrint={handlePrint}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text className="font-sans text-sm text-text-muted mb-4">
            {t('legacy.subtitle')}
          </Text>
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          <View className="mt-4">
            {!showGenerateForm ? (
              <Button
                title={t('legacy.generateKey')}
                onPress={() => setShowGenerateForm(true)}
                icon="key-outline"
                variant="outline"
              />
            ) : (
              <View className="bg-surface rounded-2xl p-4">
                {/* Key type selector */}
                <Text className="font-sans-medium text-sm text-text-secondary mb-2">
                  {t('legacy.keyCode')}
                </Text>
                <View className="flex-row mb-4" style={{ gap: 8 }}>
                  {['QR_CODE', 'EMAIL_LINK', 'BOTH'].map((type) => {
                    const typeKey = {
                      QR_CODE: 'legacy.keyTypeQR',
                      EMAIL_LINK: 'legacy.keyTypeEmail',
                      BOTH: 'legacy.keyTypeBoth',
                    }[type];
                    return (
                      <Button
                        key={type}
                        title={t(typeKey)}
                        onPress={() => setKeyType(type)}
                        variant={keyType === type ? 'primary' : 'outline'}
                        size="md"
                      />
                    );
                  })}
                </View>

                {/* Recipient (optional) */}
                {(keyType === 'EMAIL_LINK' || keyType === 'BOTH') ? (
                  <>
                    <TextInput
                      label={t('legacy.recipientEmail')}
                      value={recipientEmail}
                      onChangeText={setRecipientEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      icon="mail-outline"
                    />
                    <TextInput
                      label={t('legacy.recipientName')}
                      value={recipientName}
                      onChangeText={setRecipientName}
                      autoCapitalize="words"
                      icon="person-outline"
                    />
                  </>
                ) : null}

                <View className="flex-row" style={{ gap: 8 }}>
                  <View className="flex-1">
                    <Button
                      title={t('common.cancel')}
                      onPress={() => {
                        setShowGenerateForm(false);
                        setRecipientEmail('');
                        setRecipientName('');
                        setKeyType('QR_CODE');
                      }}
                      variant="outline"
                    />
                  </View>
                  <View className="flex-1">
                    <Button
                      title={t('legacy.generateKey')}
                      onPress={handleGenerate}
                      loading={isGenerating}
                      icon="key-outline"
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
