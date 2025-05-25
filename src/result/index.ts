export interface Result<T, E> {
  isOk(): boolean;
  isErr(): boolean;

  map<U>(fn: (value: T) => U): Result<U, E>;
  mapErr<F>(fn: (err: E) => F): Result<T, F>;
  chain<U>(fn: (value: T) => Result<U, E>): Result<U, E>;
  unwrapOr(defaultValue: T): T;
  match<U>(cases: { ok: (value: T) => U; err: (err: E) => U }): U;
  equals(other: Result<T, E>): boolean;

  extract(): T | E;
}

export class Ok<T, E> implements Result<T, E> {
  constructor(private readonly value: T) {}

  isOk(): boolean {
    return true;
  }

  isErr(): boolean {
    return false;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return new Ok(fn(this.value));
  }

  mapErr<F>(_: (err: E) => F): Result<T, F> {
    return new Ok(this.value);
  }

  chain<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  unwrapOr(_: T): T {
    return this.value;
  }

  match<U>(cases: { ok: (value: T) => U; err: (err: E) => U }): U {
    return cases.ok(this.value);
  }

  equals(other: Result<T, E>): boolean {
    return other.isOk() ? this.value === other.extract() : false;
  }

  extract(): T {
    return this.value;
  }
}

export class Err<T, E> implements Result<T, E> {
  constructor(private readonly error: E) {}

  isOk(): boolean {
    return false;
  }

  isErr(): boolean {
    return true;
  }

  map<U>(_: (value: T) => U): Result<U, E> {
    return new Err<U, E>(this.error);
  }

  mapErr<F>(fn: (err: E) => F): Result<T, F> {
    return new Err<T, F>(fn(this.error));
  }

  chain<U>(_: (value: T) => Result<U, E>): Result<U, E> {
    return new Err<U, E>(this.error);
  }

  unwrapOr(defaultValue: T): T {
    return defaultValue;
  }

  match<U>(cases: { ok: (value: T) => U; err: (err: E) => U }): U {
    return cases.err(this.error);
  }

  equals(other: Result<T, E>): boolean {
    return other.isErr() ? this.error === other.extract() : false;
  }

  extract(): E {
    return this.error;
  }
}

export const fromThrowable = <T, E = unknown>(fn: () => T, onError?: (e: unknown) => E): Result<T, E> => {
  try {
    return new Ok(fn());
  } catch (e) {
    return new Err(onError ? onError(e) : (e as E));
  }
};

export const fromPromise = async <T, E = unknown>(
  promise: Promise<T>,
  onError?: (e: unknown) => E
): Promise<Result<T, E>> => {
  try {
    const data = await promise;
    return new Ok<T, E>(data);
  } catch (e) {
    return new Err<T, E>(onError ? onError(e) : (e as E));
  }
};

export const fromAsync = async <T, E = unknown>(
  fn: () => Promise<T>,
  onError?: (e: unknown) => E
): Promise<Result<T, E>> => {
  try {
    const data = await fn();
    return new Ok<T, E>(data);
  } catch (e) {
    return new Err<T, E>(onError ? onError(e) : (e as E));
  }
};

export const map =
  <T, E, U>(fn: (value: T) => U) =>
  (result: Result<T, E>): Result<U, E> => {
    return result.map(fn);
  };

export const mapErr =
  <T, E, F>(fn: (err: E) => F) =>
  (result: Result<T, E>): Result<T, F> => {
    return result.mapErr(fn);
  };

export const chain =
  <T, E, U>(fn: (value: T) => Result<U, E>) =>
  (result: Result<T, E>): Result<U, E> => {
    return result.chain(fn);
  };

export const unwrapOr =
  <T, E>(defaultValue: T) =>
  (result: Result<T, E>): T => {
    return result.unwrapOr(defaultValue);
  };

export const match =
  <T, E, U>(cases: { ok: (value: T) => U; err: (err: E) => U }) =>
  (result: Result<T, E>): U => {
    return result.match(cases);
  };

export const equals =
  <T, E>(other: Result<T, E>) =>
  (result: Result<T, E>): boolean => {
    return result.equals(other);
  };

export const ok = <T, E>(value: T): Result<T, E> => new Ok(value);
export const err = <T, E>(error: E): Result<T, E> => new Err(error);
