export interface Either<L, R> {
  isLeft(): boolean;
  isRight(): boolean;

  map<U>(fn: (value: R) => U): Either<L, U>;
  mapLeft<M>(fn: (err: L) => M): Either<M, R>;
  chain<U>(fn: (value: R) => Either<L, U>): Either<L, U>;
  unwrapOr(defaultValue: R): R;
  match<T>(cases: { left: (left: L) => T; right: (right: R) => T }): T;
}

export class Right<R, L = unknown> implements Either<L, R> {
  constructor(private readonly value: R) {}

  isLeft(): boolean {
    return false;
  }

  isRight(): boolean {
    return true;
  }

  map<U>(fn: (value: R) => U): Either<L, U> {
    return new Right(fn(this.value));
  }

  mapLeft<M>(_fn: (err: L) => M): Either<M, R> {
    return new Right(this.value);
  }

  chain<U>(fn: (value: R) => Either<L, U>): Either<L, U> {
    return fn(this.value);
  }

  unwrapOr(_: R): R {
    return this.value;
  }

  match<T>(cases: { left: (left: L) => T; right: (right: R) => T }): T {
    return cases.right(this.value);
  }
}

export class Left<L, R = unknown> implements Either<L, R> {
  constructor(private readonly value: L) {}

  isLeft(): boolean {
    return true;
  }

  isRight(): boolean {
    return false;
  }

  map<U>(_: (value: R) => U): Either<L, U> {
    return new Left(this.value);
  }

  mapLeft<M>(fn: (err: L) => M): Either<M, R> {
    return new Left(fn(this.value));
  }

  chain<U>(_: (value: R) => Either<L, U>): Either<L, U> {
    return new Left<L, U>(this.value);
  }

  unwrapOr(defaultValue: R): R {
    return defaultValue;
  }

  match<T>(cases: { left: (left: L) => T; right: (right: R) => T }): T {
    return cases.left(this.value);
  }
}

export const tryCatch = <L = unknown, R = unknown>(
  fn: () => R,
  onError?: (e: unknown) => L
): Either<L, R> => {
  try {
    return new Right<R, L>(fn());
  } catch (e) {
    return new Left<L, R>(onError ? onError(e) : (e as L));
  }
};

export const fromPromise = async <L, R>(
  promise: Promise<R>,
  onError?: (e: unknown) => L
): Promise<Either<L, R>> => {
  try {
    const data = await promise;
    return new Right<R, L>(data);
  } catch (e) {
    return new Left<L, R>(onError ? onError(e) : (e as L));
  }
};

export const fromAsync = async <L, R>(
  fn: () => Promise<R>,
  onError?: (e: unknown) => L
): Promise<Either<L, R>> => {
  try {
    const data = await fn();
    return new Right<R, L>(data);
  } catch (e) {
    return new Left<L, R>(onError ? onError(e) : (e as L));
  }
};


export const mapE = <L, R, U>(
  fn: (value: R) => U
) => (either: Either<L, R>): Either<L, U> => {
  return either.map(fn);
};

export const mapLeftE = <L, M, R>(
  fn: (err: L) => M
) => (either: Either<L, R>): Either<M, R> => {
  return either.mapLeft(fn);
};

export const chainE = <L, R, U>(
  fn: (value: R) => Either<L, U>
) => (either: Either<L, R>): Either<L, U> => {
  return either.chain(fn);
};

export const unwrapOrE = <L, R>(
  defaultValue: R
) => (either: Either<L, R>): R => {
  return either.unwrapOr(defaultValue);
};

export const matchE = <L, R, T>(
  cases: { left: (left: L) => T; right: (right: R) => T }
) => (either: Either<L, R>): T => {
  return either.match(cases);
};
