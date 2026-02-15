import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { RELATIONSHIP_TYPES } from '../../constants/relationships';
import { colors } from '../../constants/colors';

const TYPE_I18N_MAP = {
  parent: 'relationship.parent',
  child: 'relationship.child',
  spouse: 'relationship.spouse',
  sibling: 'relationship.sibling',
  step_parent: 'relationship.stepParent',
  step_child: 'relationship.stepChild',
  step_sibling: 'relationship.stepSibling',
  adopted: 'relationship.adopted',
  guardian: 'relationship.guardian',
};

export default function RelationshipTypeSelector({ value, onChange, label, error }) {
  const { t } = useTranslation();

  return (
    <View className="mb-4">
      {label ? (
        <Text className="font-sans-medium text-sm text-text-secondary mb-1.5 ml-1">
          {label}
        </Text>
      ) : null}

      <View
        className="bg-surface rounded-2xl border border-border overflow-hidden"
        accessibilityRole="radiogroup"
      >
        {RELATIONSHIP_TYPES.map((type, index) => {
          const isActive = value === type;
          const isLast = index === RELATIONSHIP_TYPES.length - 1;

          return (
            <TouchableOpacity
              key={type}
              onPress={() => onChange(isActive ? null : type)}
              className={`flex-row items-center px-4 py-3.5 ${!isLast ? 'border-b border-border' : ''}`}
              accessibilityRole="radio"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={t(TYPE_I18N_MAP[type])}
            >
              <View
                className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                  isActive ? 'border-primary bg-primary' : 'border-border'
                }`}
              >
                {isActive ? (
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                ) : null}
              </View>

              <Text
                className={`font-sans text-base flex-1 ${
                  isActive ? 'text-primary font-sans-semibold' : 'text-text-primary'
                }`}
              >
                {t(TYPE_I18N_MAP[type])}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error ? (
        <Text
          className="font-sans text-sm text-error mt-1 ml-1"
          accessibilityRole="alert"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
