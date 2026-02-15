import { View, Text } from 'react-native';
import EventCard from './EventCard';

export default function EventSection({ title, events, relativesMap, onEventPress }) {
  if (!events || events.length === 0) return null;

  return (
    <View className="mb-6">
      <Text className="font-sans-semibold text-lg text-text-primary mb-3">
        {title}
      </Text>
      {events.map((event) => (
        <EventCard
          key={`${event.relativeId}-${event.type}-${event.date}`}
          event={event}
          relativeMeta={relativesMap.get(event.relativeId)}
          onPress={onEventPress}
        />
      ))}
    </View>
  );
}
