import { toQuantity, totalNominaciones } from './caja';

describe('nominaciones', () => {
  it('calcula el total a partir de subtotales', () => {
    expect(totalNominaciones([{ subtotal: 500 }, { subtotal: 1500 }])).toBe(2000);
  });

  it('normaliza cantidades inválidas a cero', () => {
    expect(toQuantity('-2')).toBe(0);
    expect(toQuantity('3.8')).toBe(3);
  });
});
