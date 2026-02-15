import { Stack } from 'expo-router';

export default function TreeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FAFAF9' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="add-relative" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="[id]/edit" />
      <Stack.Screen name="[id]/add-audio" />
      <Stack.Screen name="[id]/record-death" />
    </Stack>
  );
}
