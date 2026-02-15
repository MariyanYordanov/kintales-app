import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

const GRADIENT_COLORS = [colors.primary.DEFAULT, colors.primary.dark];

function getInitials(name) {
  if (!name) return '?';

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

export default function Avatar({
  source,
  name,
  size = 120,
  onPress,
  showEditBadge = false,
  isUploading = false,
  accessibilityLabel,
}) {
  const initials = getInitials(name);
  const fontSize = size * 0.35;
  const badgeSize = size * 0.3;

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    overflow: 'hidden',
  };

  const renderContent = () => {
    if (source?.uri) {
      return (
        <Image
          source={{ uri: source.uri }}
          style={{ width: size, height: size }}
          contentFit="cover"
          transition={200}
          accessibilityLabel={accessibilityLabel || `${name} avatar`}
        />
      );
    }

    return (
      <LinearGradient
        colors={GRADIENT_COLORS}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize,
            color: '#FFFFFF',
            fontFamily: 'PlusJakartaSans_700Bold',
          }}
          accessibilityLabel={accessibilityLabel || `${name} initials`}
        >
          {initials}
        </Text>
      </LinearGradient>
    );
  };

  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress
    ? {
        onPress,
        activeOpacity: 0.7,
        accessibilityRole: 'button',
        accessibilityLabel: accessibilityLabel || 'Change profile photo',
      }
    : {};

  return (
    <Wrapper {...wrapperProps} style={containerStyle}>
      {renderContent()}

      {isUploading ? (
        <View
          style={{
            ...containerStyle,
            position: 'absolute',
            backgroundColor: 'rgba(0,0,0,0.4)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator color="#FFFFFF" size="small" />
        </View>
      ) : null}

      {showEditBadge && !isUploading ? (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            backgroundColor: colors.primary.DEFAULT,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 3,
            borderColor: '#FFFFFF',
          }}
        >
          <Ionicons name="camera" size={badgeSize * 0.5} color="#FFFFFF" />
        </View>
      ) : null}
    </Wrapper>
  );
}
