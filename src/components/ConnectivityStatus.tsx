import { Text, View } from 'react-native';
import { useConnectivity } from '../services/connectivity';

export function ConnectivityStatus() {
  const online = useConnectivity();
  if (online) return null;
  return <View className="bg-amber-100 px-4 py-2"><Text className="text-center text-sm text-amber-900">Sin conexión: los cambios se reintentarán al volver la red.</Text></View>;
}
