export interface Maybe<T> {
  isJust(): boolean;
  isNothing(): boolean;

  map<U>(fn: (value: T) => U): Maybe<U>;
  chain<U>(fn: (value: T) => Maybe<U>): Maybe<U>;
  unwrapOr(defaultValue: T): T;
  match<U>(cases: { just: (value: T) => U; nothing: () => U }): U;
  equals(other: Maybe<T>): boolean;

  extract(): T;
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

  unwrapOr(_: T): T {
    return this.value;
  }

  match<U>(cases: { just: (value: T) => U; nothing: () => U }): U {
    return cases.just(this.value);
  }

  equals(other: Maybe<T>): boolean {
    return other.isJust() ? this.value === other.extract() : false;
  }

  extract(): T {
    return this.value;
  }
}

export class Nothing<T = never> implements Maybe<T> {
  constructor() {}

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

  unwrapOr(defaultValue: T): T {
    return defaultValue;
  }

  match<U>(cases: { just: (value: T) => U; nothing: () => U }): U {
    return cases.nothing();
  }

  equals(other: Maybe<T>): boolean {
    return other.isNothing();
  }

  extract(): T {
    return undefined as T;
  }
}

export const fromNullable = <T>(value: T | null | undefined): Maybe<T> => {
  return value == null ? new Nothing<T>() : new Just<T>(value);
};

export const map =
  <T, U>(fn: (value: T) => U) =>
  (maybe: Maybe<T>): Maybe<U> => {
    return maybe.map(fn);
  };

export const chain =
  <T, U>(fn: (value: T) => Maybe<U>) =>
  (maybe: Maybe<T>): Maybe<U> => {
    return maybe.chain(fn);
  };

export const unwrapOr =
  <T>(defaultValue: T) =>
  (maybe: Maybe<T>): T => {
    return maybe.unwrapOr(defaultValue);
  };

export const match =
  <T, U>(cases: { just: (value: T) => U; nothing: () => U }) =>
  (maybe: Maybe<T>): U => {
    return maybe.match(cases);
  };

export const equals =
  <T>(other: Maybe<T>) =>
  (maybe: Maybe<T>): boolean => {
    return maybe.equals(other);
  };

export const just = <T>(value: T): Maybe<T> => new Just(value);
export const nothing = <T = never>() => new Nothing<T>();
