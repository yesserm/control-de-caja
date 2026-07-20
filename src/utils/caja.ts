import type { Nominacion } from '../types/models';

export const DENOMINACIONES = [10, 20, 50, 100, 200, 500, 1000] as const;
export const toQuantity = (value: string | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
};
export const totalNominaciones = (items: Pick<Nominacion, 'subtotal'>[]) => items.reduce((total, item) => total + item.subtotal, 0);
export const currency = (amount: number | null | undefined) => {
  const value = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;
  return `C$ ${value.toLocaleString('es-NI', { minimumFractionDigits: 2 })}`;
};
