import NetInfo from '@react-native-community/netinfo';
import { useSyncExternalStore } from 'react';

let online = true;
const listeners = new Set<() => void>();
NetInfo.addEventListener((state) => { online = state.isConnected !== false && state.isInternetReachable !== false; listeners.forEach((listener) => listener()); });

export function useConnectivity() { return useSyncExternalStore((listener) => { listeners.add(listener); return () => listeners.delete(listener); }, () => online, () => true); }
