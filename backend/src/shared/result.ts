export class Result<T, E = string> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  public readonly error: E | null;
  private readonly _value: T | null;

  private constructor(isSuccess: boolean, error: E | null, value: T | null) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this._value = value;
  }

  public getValue(): T {
    if (!this.isSuccess || this._value === null) {
      throw new Error('No puedes obtener el valor de un resultado fallido.');
    }
    return this._value;
  }

  public static ok<T, E = string>(value: T): Result<T, E> {
    return new Result<T, E>(true, null, value);
  }

  public static fail<T, E = string>(error: E): Result<T, E> {
    return new Result<T, E>(false, error, null);
  }
}