import { Result } from './result';

describe('Result ROP Monad', () => {
  it('debe crear un resultado exitoso correctamente', () => {
    const result = Result.ok<string>('Operación exitosa');
    expect(result.isSuccess).toBe(true);
    expect(result.isFailure).toBe(false);
    expect(result.error).toBeNull();
    expect(result.getValue()).toBe('Operación exitosa');
  });

  it('debe crear un resultado fallido correctamente', () => {
    const result = Result.fail<string, string>('Error de negocio');
    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Error de negocio');
  });

  it('debe lanzar una excepción si se intenta obtener el valor de un fallo', () => {
    const result = Result.fail<string, string>('Falló la validación');

    expect(() => result.getValue()).toThrow(
      'No puedes obtener el valor de un resultado fallido.',
    );
  });
});