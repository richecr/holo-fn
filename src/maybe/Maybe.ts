// src/maybe/Maybe.ts

export interface Maybe<T> {
  isJust(): boolean;
  isNothing(): boolean;

  map<U>(fn: (value: T) => U): Maybe<U>;
  chain<U>(fn: (value: T) => Maybe<U>): Maybe<U>;
  getOrElse(defaultValue: T): T;
  match<U>(cases: { Just: (value: T) => U; Nothing: () => U }): U;
}

export class Just<T> implements Maybe<T> {
  constructor(private readonly value: T) {}

  isJust(): boolean {
    return true;
  }

  isNothing(): boolean {
    return false;
  }

  map<U>(fn: (value: T) => U): Maybe<U> {
    return new Just(fn(this.value));
  }

  chain<U>(fn: (value: T) => Maybe<U>): Maybe<U> {
    return fn(this.value);
  }

  getOrElse(_: T): T {
    return this.value;
  }

  match<U>(cases: { Just: (value: T) => U; Nothing: () => U }): U {
    return cases.Just(this.value);
  }
}

export class Nothing<T> implements Maybe<T> {
  isJust(): boolean {
    return false;
  }

  isNothing(): boolean {
    return true;
  }

  map<U>(_: (value: T) => U): Maybe<U> {
    return new Nothing<U>();
  }

  chain<U>(_: (value: T) => Maybe<U>): Maybe<U> {
    return new Nothing<U>();
  }

  getOrElse(defaultValue: T): T {
    return defaultValue;
  }

  match<U>(cases: { Just: (value: T) => U; Nothing: () => U }): U {
    return cases.Nothing();
  }
}

export const fromNullable = <T>(value: T | null | undefined): Maybe<T> => {
  return value == null ? new Nothing<T>() : new Just<T>(value);
};
