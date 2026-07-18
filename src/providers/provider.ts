import { firebaseProvider } from './firebaseProvider';
import { jsonProvider } from './jsonProvider';
import { sqliteProvider } from './sqliteProvider';
import type { DataProvider, DataProviderName } from './types';
import { resolveProviderName } from './providerConfig';

const providerName: DataProviderName = resolveProviderName(process.env.EXPO_PUBLIC_DATA_PROVIDER);
const providers: Record<DataProviderName, DataProvider> = { json: jsonProvider, sqlite: sqliteProvider, firebase: firebaseProvider };

export const dataProvider = providers[providerName];
export const activeProvider = providerName;
