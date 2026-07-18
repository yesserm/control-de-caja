import { ActivityIndicator, Text, View } from 'react-native';
import { Button } from './Button';

export function Loading() { return <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color="#2563eb" /></View>; }
export function ErrorMessage({ message, retry }: { message: string; retry?: () => void }) {
  return <View className="rounded-lg border border-red-200 bg-red-50 p-3"><Text className="mb-2 text-red-700">{message}</Text>{retry ? <Button title="Reintentar" onPress={retry} variant="secondary" /> : null}</View>;
}
