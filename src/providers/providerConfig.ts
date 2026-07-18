import type { DataProviderName } from './types';

const names: DataProviderName[] = ['json', 'sqlite', 'firebase'];

export function resolveProviderName(value: string | undefined): DataProviderName {
  if (!value) return 'json';
  if (names.includes(value as DataProviderName)) return value as DataProviderName;
  throw new Error('EXPO_PUBLIC_DATA_PROVIDER debe ser json, sqlite o firebase.');
}
