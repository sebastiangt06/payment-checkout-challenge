import { describe, it, expect } from 'vitest';
import { validateLuhn, detectCardBrand } from '@/utils/cardUtils';

describe('cardUtils Unit Tests', () => {
  it('debe validar correctamente números de tarjeta según el algoritmo de Luhn', () => {
    expect(validateLuhn('4242424242424242')).toBe(true);
    expect(validateLuhn('5555555555554444')).toBe(true);
    expect(validateLuhn('4000000000000001')).toBe(false);
  });

  it('debe detectar la franquicia adecuada basada en el BIN', () => {
    expect(detectCardBrand('4242424242424242')).toBe('VISA');
    expect(detectCardBrand('5105105105105105')).toBe('MASTERCARD');
    expect(detectCardBrand('378282246381005')).toBe('UNKNOWN');
  });
});