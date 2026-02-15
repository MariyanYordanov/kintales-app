import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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
} from '../../services/relatives.service';
import { formatLifeSpan } from '../../lib/utils/dateFormatter';
import Avatar from '../../components/profile/Avatar';
import StatusBadge from '../../components/person/StatusBadge';
import PhotoGallery from '../../components/person/PhotoGallery';
import AudioList from '../../components/person/AudioList';
import Button from '../../components/ui/Button';
import { colors } from '../../constants/colors';

const BIO_PREVIEW_LENGTH = 300;

export default function PersonProfile() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const [person, setPerson] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [audio, setAudio] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMediaLoading, setIsMediaLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);

      const { data: personRes } = await getRelativeById(id);
      setPerson(personRes.data);

      // Media is non-critical — load separately
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

        {/* Divider */}
        <View className="h-px bg-border mx-6" />

        {/* Photos Section */}
        <View className="px-6 py-4">
          <Text className="font-sans-semibold text-lg text-text-primary mb-3">
            {t('person.photos')}
          </Text>
          <PhotoGallery photos={photos} isLoading={isMediaLoading} />
        </View>

        {/* Divider */}
        <View className="h-px bg-border mx-6" />

        {/* Audio Section */}
        <View className="px-6 py-4">
          <Text className="font-sans-semibold text-lg text-text-primary mb-3">
            {t('person.audioRecordings')}
          </Text>
          <AudioList recordings={audio} isLoading={isMediaLoading} />
        </View>

        {/* Divider */}
        <View className="h-px bg-border mx-6" />

        {/* Actions */}
        <View className="px-6 py-6">
          <Button
            title={t('person.edit')}
            onPress={handleEdit}
            icon="create-outline"
          />
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
