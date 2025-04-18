export interface Maybe<T> {
  isJust(): boolean;
  isNothing(): boolean;

  map<U>(fn: (value: T) => U): Maybe<U>;
  chain<U>(fn: (value: T) => Maybe<U>): Maybe<U>;
  unwrapOr(defaultValue: T): T;
  match<U>(cases: { just: (value: T) => U; nothing: () => U }): U;
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

  unwrapOr(defaultValue: T): T {
    return defaultValue;
  }

  match<U>(cases: { just: (value: T) => U; nothing: () => U }): U {
    return cases.nothing();
  }
}

export const fromNullable = <T>(value: T | null | undefined): Maybe<T> => {
  return value == null ? new Nothing<T>() : new Just<T>(value);
};

export const mapM = <T, U>(
  fn: (value: T) => U
) => (maybe: Maybe<T>): Maybe<U> => {
  return maybe.map(fn);
};

export const chainM = <T, U>(
  fn: (value: T) => Maybe<U>
) => (maybe: Maybe<T>): Maybe<U> => {
  return maybe.chain(fn);
};

export const unwrapOrM = <T>(defaultValue: T) => (maybe: Maybe<T>): T => {
  return maybe.unwrapOr(defaultValue);
};

export const matchM = <T, U>(
  cases: { just: (value: T) => U; nothing: () => U }
) => (maybe: Maybe<T>): U => {
  return maybe.match(cases);
};
