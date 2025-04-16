export interface Either<L, R> {
  isLeft(): boolean;
  isRight(): boolean;

  map<U>(fn: (value: R) => U): Either<L, U>;
  chain<U>(fn: (value: R) => Either<L, U>): Either<L, U>;
  getOrElse(defaultValue: R): R;
  fold<T>(onLeft: (left: L) => T, onRight: (right: R) => T): T;
}

export class Right<L, R> implements Either<L, R> {
  constructor(private readonly value: R) {}

  isLeft(): boolean {
    return false;
  }

  isRight(): boolean {
    return true;
  }

  map<U>(fn: (value: R) => U): Either<L, U> {
    return new Right<L, U>(fn(this.value));
  }

  chain<U>(fn: (value: R) => Either<L, U>): Either<L, U> {
    return fn(this.value);
  }

  getOrElse(_: R): R {
    return this.value;
  }

  fold<T>(_: (left: L) => T, onRight: (right: R) => T): T {
    return onRight(this.value);
  }
}

export class Left<L, R> implements Either<L, R> {
  constructor(private readonly value: L) {}

  isLeft(): boolean {
    return true;
  }

  isRight(): boolean {
    return false;
  }

  map<U>(_: (value: R) => U): Either<L, U> {
    return new Left<L, U>(this.value);
  }

  chain<U>(_: (value: R) => Either<L, U>): Either<L, U> {
    return new Left<L, U>(this.value);
  }

  getOrElse(defaultValue: R): R {
    return defaultValue;
  }

  fold<T>(onLeft: (left: L) => T, _: (right: R) => T): T {
    return onLeft(this.value);
  }
}

export const tryCatch = <L = unknown, R = unknown>(
  fn: () => R,
  onError?: (e: unknown) => L
): Either<L, R> => {
  try {
    return new Right<L, R>(fn());
  } catch (e) {
    return new Left<L, R>(onError ? onError(e) : (e as L));
  }
};
