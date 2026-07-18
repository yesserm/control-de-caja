export const isPositiveAmount = (value: string) => Number.isFinite(Number(value)) && Number(value) > 0;
export const hasRequiredFields = (...values: string[]) => values.every((value) => value.trim().length > 0);
