// src/utils/__tests__/currencyFormatter.test.ts
import { formatCOP } from '@/utils/currencyFormater';

describe('currencyFormatter - Formateador de moneda COP', () => {
  it('debe formatear números correctamente a formato Pesos Colombianos', () => {
    const formatted = formatCOP(185000);
    // Valida que contenga el separador de miles y el número 185
    expect(formatted).toContain('185');
    expect(formatted).toMatch(/\$?\s?185[\.,]000/);
  });

  it('debe manejar el valor 0 de forma correcta', () => {
    const formatted = formatCOP(0);
    expect(formatted).toContain('0');
  });

  it('debe formatear montos grandes de tarifa o total', () => {
    const formatted = formatCOP(240000);
    expect(formatted).toContain('240');
  });
});