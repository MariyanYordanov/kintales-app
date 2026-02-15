import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import {
  getRelativeById,
  deleteRelative,
  getRelativePhotos,
  getRelativeAudio,
  anonymizeRelative,
} from '../../services/relatives.service';
import { deletePhoto, deleteAudio } from '../../services/media.service';
import { getTreeDeathRecords, confirmDeathRecord } from '../../services/death.service';
import { useAuth } from '../../lib/auth/authContext';
import { usePhotoPicker } from '../../hooks/usePhotoPicker';
import { formatLifeSpan } from '../../lib/utils/dateFormatter';
import Avatar from '../../components/profile/Avatar';
import StatusBadge from '../../components/person/StatusBadge';
import PhotoGallery from '../../components/person/PhotoGallery';
import AudioList from '../../components/person/AudioList';
import PhotoUploadForm from '../../components/media/PhotoUploadForm';
import DeathConfirmationBanner from '../../components/death/DeathConfirmationBanner';
import Button from '../../components/ui/Button';
import { colors } from '../../constants/colors';

const BIO_PREVIEW_LENGTH = 300;

export default function PersonProfile() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pickFromCamera, pickPhotos, isProcessing } = usePhotoPicker();

  const [person, setPerson] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [audio, setAudio] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMediaLoading, setIsMediaLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Death confirmation state
  const [pendingDeathRecord, setPendingDeathRecord] = useState(null);
  const [isDeathActionLoading, setIsDeathActionLoading] = useState(false);

  // Photo upload state
  const [pendingPhotos, setPendingPhotos] = useState(null);
  const [isUploadFormVisible, setIsUploadFormVisible] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);

      const { data: personRes } = await getRelativeById(id);
      const personData = personRes.data;
      setPerson(personData);

      // Check for pending death records (only for alive persons)
      if (personData.status === 'ALIVE' && personData.treeId) {
        try {
          const { data: deathRes } = await getTreeDeathRecords(personData.treeId);
          const pending = (deathRes.data || []).find(
            (dr) => dr.relativeId === id && dr.status === 'PENDING',
          );
          setPendingDeathRecord(pending || null);
        } catch {
          // Non-critical — banner just won't show
        }
      } else {
        setPendingDeathRecord(null);
      }

      try {
        const [photosRes, audioRes] = await Promise.all([
          getRelativePhotos(id),
          getRelativeAudio(id),
        ]);
        setPhotos(photosRes.data.data || []);
        setAudio(audioRes.data.data || []);
      } catch {
        // Non-critical — gallery/audio will show empty
      } finally {
        setIsMediaLoading(false);
      }
    } catch (err) {
      console.error('Failed to load person:', err);
      setError(err.response?.status === 404 ? 'notFound' : 'generic');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      setIsMediaLoading(true);
      loadData();
    }, [loadData]),
  );

  const handleEdit = useCallback(() => {
    router.push(`/tree/${id}/edit`);
  }, [id, router]);

  const handleDelete = useCallback(() => {
    if (!person) return;

    Alert.alert(
      t('person.deleteConfirmTitle'),
      t('person.deleteConfirmMessage', { name: person.fullName }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteRelative(id);
              Alert.alert(t('common.done'), t('person.deleteSuccess'));
              router.replace('/(tabs)/tree');
            } catch (err) {
              console.error('Failed to delete person:', err);
              Alert.alert(t('common.error'), t('person.deleteError'));
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  }, [person, id, t, router]);

  // Photo upload flow
  const openPhotoActionSheet = useCallback(async (mode) => {
    let result = null;

    if (mode === 'camera') {
      result = await pickFromCamera();
    } else if (mode === 'library') {
      result = await pickPhotos({ multiple: false });
    } else if (mode === 'bulk') {
      result = await pickPhotos({ multiple: true });
    }

    if (result && result.length > 0) {
      setPendingPhotos(result);
      setIsUploadFormVisible(true);
    }
  }, [pickFromCamera, pickPhotos]);

  const handleAddPhoto = useCallback(() => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('common.cancel'), t('media.takePhoto'), t('media.chooseFromLibrary'), t('media.bulkUpload')],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) openPhotoActionSheet('camera');
          else if (buttonIndex === 2) openPhotoActionSheet('library');
          else if (buttonIndex === 3) openPhotoActionSheet('bulk');
        },
      );
    } else {
      Alert.alert(
        t('media.addPhoto'),
        null,
        [
          { text: t('media.takePhoto'), onPress: () => openPhotoActionSheet('camera') },
          { text: t('media.chooseFromLibrary'), onPress: () => openPhotoActionSheet('library') },
          { text: t('media.bulkUpload'), onPress: () => openPhotoActionSheet('bulk') },
          { text: t('common.cancel'), style: 'cancel' },
        ],
      );
    }
  }, [t, openPhotoActionSheet]);

  const handlePhotoUploadSuccess = useCallback(async () => {
    setIsUploadFormVisible(false);
    setPendingPhotos(null);
    try {
      const { data: photosRes } = await getRelativePhotos(id);
      setPhotos(photosRes.data.data || []);
    } catch {
      // Non-critical
    }
  }, [id]);

  const handlePhotoUploadCancel = useCallback(() => {
    setIsUploadFormVisible(false);
    setPendingPhotos(null);
  }, []);

  const handlePhotoDeleted = useCallback(async (photoId) => {
    try {
      await deletePhoto(photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (err) {
      console.error('Failed to delete photo:', err);
      Alert.alert(t('common.error'), t('person.deleteError'));
    }
  }, [t]);

  // Audio handlers
  const handleAddAudio = useCallback(() => {
    router.push(`/tree/${id}/add-audio`);
  }, [id, router]);

  const handleAudioDeleted = useCallback(async (audioId) => {
    try {
      await deleteAudio(audioId);
      setAudio((prev) => prev.filter((a) => a.id !== audioId));
    } catch (err) {
      console.error('Failed to delete audio:', err);
      Alert.alert(t('common.error'), t('person.deleteError'));
    }
  }, [t]);

  // Death confirmation handlers
  const handleConfirmDeath = useCallback(async () => {
    if (!pendingDeathRecord) return;
    setIsDeathActionLoading(true);
    try {
      await confirmDeathRecord(pendingDeathRecord.id, true);
      Alert.alert(t('common.done'), t('death.confirmSuccess'));
      setPendingDeathRecord(null);
      setIsLoading(true);
      loadData();
    } catch (err) {
      console.error('Failed to confirm death:', err);
      Alert.alert(t('common.error'), t('death.confirmError'));
    } finally {
      setIsDeathActionLoading(false);
    }
  }, [pendingDeathRecord, loadData, t]);

  const handleDisputeDeath = useCallback(async () => {
    if (!pendingDeathRecord) return;
    setIsDeathActionLoading(true);
    try {
      await confirmDeathRecord(pendingDeathRecord.id, false);
      Alert.alert(t('common.done'), t('death.disputeSuccess'));
      setPendingDeathRecord(null);
    } catch (err) {
      console.error('Failed to dispute death:', err);
      Alert.alert(t('common.error'), t('death.disputeError'));
    } finally {
      setIsDeathActionLoading(false);
    }
  }, [pendingDeathRecord, t]);

  const handleAnonymize = useCallback(() => {
    if (!person) return;

    Alert.alert(
      t('privacy.anonymizeConfirm'),
      t('privacy.anonymizeConfirmMessage', { name: person.fullName }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('privacy.anonymizeButton'),
          style: 'destructive',
          onPress: async () => {
            try {
              await anonymizeRelative(id);
              Alert.alert(t('common.done'), t('privacy.anonymizeSuccess'));
              setIsLoading(true);
              loadData();
            } catch (err) {
              console.error('Failed to anonymize relative:', err);
              Alert.alert(t('common.error'), t('privacy.anonymizeError'));
            }
          },
        },
      ],
    );
  }, [person, id, t, loadData]);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <Header onBack={() => router.back()} title={t('person.profileTitle')} backLabel={t('common.back')} />
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="alert-circle-outline" size={48} color={colors.text.muted} />
          <Text className="font-sans-medium text-base text-text-secondary text-center mt-4 mb-6">
            {error === 'notFound' ? t('common.noData') : t('person.loadError')}
          </Text>
          {error !== 'notFound' ? (
            <Button
              title={t('common.retry')}
              onPress={() => { setIsLoading(true); loadData(); }}
              variant="outline"
              icon="refresh-outline"
            />
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  const bio = person.bio || '';
  const isBioLong = bio.length > BIO_PREVIEW_LENGTH;
  const displayBio = isBioLong && !isBioExpanded
    ? bio.slice(0, BIO_PREVIEW_LENGTH) + '...'
    : bio;
  const lifeSpan = formatLifeSpan(person, t);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <Header onBack={() => router.back()} title={t('person.profileTitle')} backLabel={t('common.back')} />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View className="items-center px-6 pt-6 pb-4">
          <Avatar
            source={person.avatarUrl ? { uri: person.avatarUrl } : null}
            name={person.fullName}
            size={120}
          />

          <Text className="font-sans-bold text-3xl text-text-primary text-center mt-4">
            {person.fullName}
          </Text>

          {lifeSpan ? (
            <Text className="font-sans text-lg text-text-secondary mt-1">
              {lifeSpan}
            </Text>
          ) : null}

          <View className="mt-3">
            <StatusBadge status={person.status} />
          </View>
        </View>

        {/* Death Confirmation Banner */}
        {pendingDeathRecord && person.status === 'ALIVE' && pendingDeathRecord.reportedBy !== user?.id ? (
          <View className="px-6 pt-2 pb-2">
            <DeathConfirmationBanner
              deathRecord={pendingDeathRecord}
              personName={person.fullName}
              onConfirm={handleConfirmDeath}
              onDispute={handleDisputeDeath}
              isLoading={isDeathActionLoading}
            />
          </View>
        ) : null}

        {/* Bio Section */}
        <View className="px-6 py-4">
          <Text className="font-sans-semibold text-lg text-text-primary mb-2">
            {t('person.biography')}
          </Text>
          {bio ? (
            <>
              <Text className="font-sans text-base text-text-secondary leading-6">
                {displayBio}
              </Text>
              {isBioLong ? (
                <TouchableOpacity
                  onPress={() => setIsBioExpanded((prev) => !prev)}
                  className="mt-1"
                  accessibilityRole="button"
                >
                  <Text className="font-sans-medium text-sm text-primary">
                    {isBioExpanded ? t('person.readLess') : t('person.readMore')}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : (
            <Text className="font-sans text-base text-text-muted italic">
              {t('person.noBio')}
            </Text>
          )}
        </View>

        <View className="h-px bg-border mx-6" />

        {/* Photos Section */}
        <View className="px-6 py-4">
          <Text className="font-sans-semibold text-lg text-text-primary mb-3">
            {t('person.photos')}
          </Text>
          <PhotoGallery
            photos={photos}
            isLoading={isMediaLoading || isProcessing}
            onAddPress={handleAddPhoto}
            onPhotoDeleted={handlePhotoDeleted}
          />
        </View>

        <View className="h-px bg-border mx-6" />

        {/* Audio Section */}
        <View className="px-6 py-4">
          <Text className="font-sans-semibold text-lg text-text-primary mb-3">
            {t('person.audioRecordings')}
          </Text>
          <AudioList
            recordings={audio}
            isLoading={isMediaLoading}
            onAddPress={handleAddAudio}
            onAudioDeleted={handleAudioDeleted}
          />
        </View>

        <View className="h-px bg-border mx-6" />

        {/* Actions */}
        <View className="px-6 py-6">
          <Button
            title={t('person.edit')}
            onPress={handleEdit}
            icon="create-outline"
          />
          {/* Record Death button — only for alive persons without pending record */}
          {person.status === 'ALIVE' && !pendingDeathRecord ? (
            <View className="mt-3">
              <Button
                title={t('death.recordDeath', { name: person.fullName.split(' ')[0] })}
                onPress={() => router.push(`/tree/${id}/record-death`)}
                variant="outline"
                icon="flower-outline"
              />
            </View>
          ) : null}

          {/* Pending death record label — shown to the reporter */}
          {person.status === 'ALIVE' && pendingDeathRecord && pendingDeathRecord.reportedBy === user?.id ? (
            <View className="mt-3 bg-surface-secondary rounded-xl p-3">
              <Text className="font-sans text-sm text-text-secondary text-center">
                {t('death.pendingLabel')}
              </Text>
            </View>
          ) : null}

          {/* Anonymize — only for living relatives */}
          {person.status === 'ALIVE' ? (
            <View className="mt-3">
              <Button
                title={t('privacy.anonymizeButton')}
                onPress={handleAnonymize}
                variant="outline"
                icon="eye-off-outline"
              />
            </View>
          ) : null}

          <View className="mt-3">
            <Button
              title={t('person.delete')}
              onPress={handleDelete}
              variant="outline"
              icon="trash-outline"
              loading={isDeleting}
            />
          </View>
        </View>
      </ScrollView>

      {/* Photo Upload Form Modal */}
      {pendingPhotos && pendingPhotos.length > 0 ? (
        <PhotoUploadForm
          photos={pendingPhotos}
          relativeId={id}
          visible={isUploadFormVisible}
          onSuccess={handlePhotoUploadSuccess}
          onCancel={handlePhotoUploadCancel}
        />
      ) : null}
    </SafeAreaView>
  );
}

function Header({ onBack, title, backLabel }) {
  return (
    <View className="flex-row items-center px-4 py-3 border-b border-border">
      <TouchableOpacity
        onPress={onBack}
        className="p-2 mr-2"
        accessibilityLabel={backLabel}
        accessibilityRole="button"
      >
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
      </TouchableOpacity>
      <Text className="font-sans-bold text-xl text-text-primary flex-1">
        {title}
      </Text>
    </View>
  );
}
