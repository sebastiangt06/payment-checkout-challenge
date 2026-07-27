// src/utils/__tests__/cardUtils.test.ts
import { detectCardBrand, validateLuhn, formatCardNumber, formatExpDate } from '../cardUtils';

describe('cardUtils - Detección de Franquicias y Algoritmo de Luhn', () => {
  describe('detectCardBrand', () => {
    it('debe detectar correctamente tarjetas VISA', () => {
      expect(detectCardBrand('4000 1234 5678 9010')).toBe('VISA');
      expect(detectCardBrand('453201558839')).toBe('VISA');
    });

    it('debe detectar correctamente tarjetas Mastercard', () => {
      expect(detectCardBrand('5105 1051 0510 5105')).toBe('MASTERCARD');
      expect(detectCardBrand('2221 0000 0000 0000')).toBe('MASTERCARD');
    });

    it('debe retornar UNKNOWN para marcas no soportadas o incompletas', () => {
      expect(detectCardBrand('3782 822463 81005')).toBe('UNKNOWN');
      expect(detectCardBrand('1234')).toBe('UNKNOWN');
    });
  });

  describe('validateLuhn', () => {
    it('debe retornar true para tarjetas numéricamente válidas por Luhn', () => {
      expect(validateLuhn('4532015112830366')).toBe(true);
    });

    it('debe retornar false para tarjetas inválidas por Luhn', () => {
      expect(validateLuhn('4532015112830367')).toBe(false);
    });

    it('debe retornar false para longitud de dígitos inválida', () => {
      expect(validateLuhn('123')).toBe(false);
      expect(validateLuhn('')).toBe(false);
    });
  });

  describe('Formateadores de entrada', () => {
    it('debe agrupar el número de tarjeta en bloques de 4 dígitos', () => {
      expect(formatCardNumber('4000123456789010')).toBe('4000 1234 5678 9010');
    });

    it('debe dar formato MM/YY a la fecha de expiración', () => {
      expect(formatExpDate('1228')).toBe('12/28');
      expect(formatExpDate('12')).toBe('12');
    });
  });
});