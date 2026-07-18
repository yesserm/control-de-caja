import { hasRequiredFields, isPositiveAmount } from './validation';

describe('validaciones de formularios', () => {
  it('rechaza credenciales vacías', () => expect(hasRequiredFields('admin', '')).toBe(false));
  it('acepta solo montos positivos', () => {
    expect(isPositiveAmount('250')).toBe(true);
    expect(isPositiveAmount('0')).toBe(false);
    expect(isPositiveAmount('texto')).toBe(false);
  });
});
