import { resolveProviderName } from './providerConfig';

describe('configuración de proveedor', () => {
  it('usa JSON como modo predeterminado', () => expect(resolveProviderName(undefined)).toBe('json'));
  it.each(['json', 'sqlite', 'firebase'] as const)('acepta el modo %s', (mode) => expect(resolveProviderName(mode)).toBe(mode));
  it('rechaza un modo desconocido', () => expect(() => resolveProviderName('convex')).toThrow('EXPO_PUBLIC_DATA_PROVIDER'));
});
