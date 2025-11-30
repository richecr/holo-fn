import { describe, expect, it } from 'bun:test';
import { pipe } from 'rambda';
import {
  all,
  chain,
  equals,
  fromAsync,
  fromPromise,
  Left,
  left,
  map,
  mapLeft,
  match,
  Right,
  right,
  tryCatch,
  unwrapOr,
  validate,
} from '../src/either';

describe('Either', () => {
  it('Right.map applies function to value', () => {
    const result = new Right(10).map((n) => n * 2);
    expect(result.unwrapOr(0)).toBe(20);
  });

  it('should transform Left value', () => {
    const result = new Left('fail')
      .mapLeft((msg) => `Error: ${msg}`)
      .match({
        left: (e) => e,
        right: () => 'nope',
      });

    expect(result).toBe('Error: fail');
  });

  it('should do nothing when mapping Left on Right', () => {
    const result = new Right(42)
      .mapLeft((msg) => `Error: ${msg}`)
      .match({
        left: () => -1,
        right: (n) => n,
      });

    expect(result).toBe(42);
  });

  it('Left.map does not apply function', () => {
    const result = new Left<string, number>('error').map((n) => n * 2);
    expect(result.unwrapOr(99)).toBe(99);
  });

  it('Right.chain unwraps and applies', () => {
    const result = new Right(5).chain((n) => new Right(n + 3));
    expect(result.unwrapOr(0)).toBe(8);
  });

  it('Left.chain does not call function', () => {
    const result = new Left<string, number>('error').chain((n) => new Right(n + 3));
    expect(result.unwrapOr(0)).toBe(0);
  });

  it('Right.validate should keep value when predicate returns true', () => {
    const result = new Right<string, number>(25).validate((x) => x >= 18, 'Must be 18+');
    expect(result.isRight()).toBe(true);
    expect(result.unwrapOr(0)).toBe(25);
  });

  it('Right.validate should convert to Left when predicate returns false', () => {
    const result = new Right<string, number>(15).validate((x) => x >= 18, 'Must be 18+');
    expect(result.isLeft()).toBe(true);
    expect(result.match({ left: (e) => e, right: (_) => '' })).toBe('Must be 18+');
  });

  it('Right.validate should support chaining multiple validations', () => {
    const validateAge = (age: number) =>
      right<string, number>(age)
        .validate((x) => x >= 0, 'Age cannot be negative')
        .validate((x) => x <= 150, 'Age too high')
        .validate((x) => x >= 18, 'Must be 18+');

    expect(validateAge(25).unwrapOr(0)).toBe(25);
    expect(validateAge(15).match({ left: (e) => e, right: (_) => '' })).toBe('Must be 18+');
    expect(validateAge(-5).match({ left: (e) => e, right: (_) => '' })).toBe('Age cannot be negative');
    expect(validateAge(200).match({ left: (e) => e, right: (_) => '' })).toBe('Age too high');
  });

  it('Right.unwrapOr returns the value', () => {
    const result = new Right(42);
    expect(result.unwrapOr(0)).toBe(42);
  });

  it('Left.unwrapOr returns default value', () => {
    const result = new Left<string, number>('fail');
    expect(result.unwrapOr(123)).toBe(123);
  });

  it('Right.match calls onRight', () => {
    const result = new Right(7).match({
      left: () => 'error',
      right: (n) => `value is ${n}`,
    });
    expect(result).toBe('value is 7');
  });

  it('Left.match calls onLeft', () => {
    const result = new Left<string, number>('bad').match({
      left: (e) => `error: ${e}`,
      right: () => 'success',
    });
    expect(result).toBe('error: bad');
  });

  it('Right.isRight returns true', () => {
    expect(new Right('x').isRight()).toBe(true);
  });

  it('Left.isRight returns false', () => {
    expect(new Left('x').isRight()).toBe(false);
  });

  it('Right.isLeft returns false', () => {
    expect(new Right('x').isLeft()).toBe(false);
  });

  it('Left.isLeft returns true', () => {
    expect(new Left('x').isLeft()).toBe(true);
  });

  it('Right.equals returns true for equal Right values', () => {
    const a = new Right(42);
    const b = new Right(42);
    expect(a.equals(b)).toBe(true);
  });

  it('Left.equals returns true for equal Left values', () => {
    const a = new Left('error');
    const b = new Left('error');
    expect(a.equals(b)).toBe(true);
  });

  it('Right.equals returns false for different Right values', () => {
    const a = new Right(42);
    const b = new Right(43);
    expect(a.equals(b)).toBe(false);
  });

  it('Left.equals returns false for different Left values', () => {
    const a = new Left('error');
    const b = new Left('different error');
    expect(a.equals(b)).toBe(false);
  });

  it('tryCatch should return Right when function succeeds', () => {
    const result = tryCatch(() => JSON.parse('{"a":1}'));
    expect(result.isRight()).toBe(true);
  });

  it('tryCatch should return Left when function throws', () => {
    const result = tryCatch(
      () => JSON.parse('{invalid'),
      (e) => `Caught: ${(e as Error).message}`
    );
    expect(result.isLeft()).toBe(true);
    expect(
      result.match({
        left: (e) => e,
        right: () => '',
      })
    ).toMatch(/^Caught:/);
  });

  it('tryCatch should fallback to casting when onError is not provided', () => {
    const result = tryCatch(() => {
      throw new Error('unexpected');
    });
    expect(result.isLeft()).toBe(true);
    expect(
      result.match({
        left: (e) => (e instanceof Error ? e.message : 'nope'),
        right: () => '',
      })
    ).toBe('unexpected');
  });
});

describe('Either fromPromise', () => {
  it('should resolve a Promise and return a Right with the result', async () => {
    const result = await fromPromise(Promise.resolve(10), (e) => `Error: ${e}`);
    expect(result.isRight()).toBe(true);
    expect(result.unwrapOr(0)).toBe(10);
  });

  it('should reject a Promise and return a Left with the error', async () => {
    const result = await fromPromise(Promise.reject<string>('Network Error'), (e) => `Error: ${e}`);
    expect(result.isLeft()).toBe(true);
    result.mapLeft((e) => expect(e).toBe('Error: Network Error'));
  });

  it('should map the error in Left when using mapLeft', async () => {
    const result = (await fromPromise(Promise.reject('Network Error'))).mapLeft((error) => `Mapped Error: ${error}`);

    expect(result.isLeft()).toBe(true);
    result.mapLeft((error) => expect(error).toBe('Mapped Error: Network Error'));
  });
});

describe('Either fromAsync', () => {
  it('should resolve an async function and return a Right with the result', async () => {
    const result = await fromAsync(
      async () => 20,
      (e) => `Error: ${e}`
    );
    expect(result.isRight()).toBe(true);
    expect(result.unwrapOr(0)).toBe(20);
  });

  it('should reject an async function and return a Left with the error', async () => {
    const result = await fromAsync<string, unknown>(
      async () => {
        throw new Error('API Error');
      },
      (e) => `Error: ${(e as Error).message}`
    );
    expect(result.isLeft()).toBe(true);
    result.mapLeft((e) => expect(e).toBe('Error: API Error'));
  });

  it('should map the error in Left when using mapLeft', async () => {
    const result = (
      await fromAsync(async () => {
        throw 'API Error';
      })
    ).mapLeft((error) => `Mapped Error: ${error}`);

    expect(result.isLeft()).toBe(true);
    result.mapLeft((error) => expect(error).toBe('Mapped Error: API Error'));
  });
});

describe('Either - Curried Helpers', () => {
  it('should apply curried map function to Right', () => {
    const result = pipe(
      new Right(10),
      map((n) => n * 2),
      unwrapOr(0)
    );
    expect(result).toBe(20);
  });

  it('should not apply map to Left (curried)', () => {
    const result = pipe(
      new Left<string, number>('Error'),
      map((n) => n * 2),
      unwrapOr(0)
    );
    expect(result).toBe(0);
  });

  it('should chain Right values with curried chain', () => {
    const result = pipe(
      right(2),
      chain((x) => new Right(x * 10)),
      unwrapOr(0)
    );
    expect(result).toBe(20);
  });

  it('should return Left when chaining from Left (curried)', () => {
    const result = pipe(
      new Left<string, number>('Error'),
      chain((x) => new Right(x * 10)),
      unwrapOr(0)
    );
    expect(result).toBe(0);
  });

  it('Left.validate should not run predicate (short-circuit)', () => {
    const result = right<string, number>(15)
      .validate((x) => x >= 18, 'Must be 18+')
      .validate((x) => x <= 100, 'Too old');

    expect(result.match({ left: (e) => e, right: (_) => '' })).toBe('Must be 18+');
  });

  it('curried validate should work with pipe', () => {
    const result = pipe(
      right<string, number>(42),
      validate((x: number) => x > 0, 'Must be positive'),
      validate((x: number) => x % 2 === 0, 'Must be even'),
      unwrapOr(0)
    );
    expect(result).toBe(42);
  });

  it('should unwrapOr with default value using curried unwrapOr', () => {
    const result = pipe(new Right(10), unwrapOr(42));
    expect(result).toBe(10);
  });

  it('should return default value for Left using curried unwrapOr', () => {
    const result = pipe(new Left<string, number>('Error'), unwrapOr(42));
    expect(result).toBe(42);
  });

  it('should apply curried mapLeft function to Left', () => {
    const result = pipe(
      left<string, string>('error'),
      mapLeft((err) => `Mapped Error: ${err}`)
    );

    expect(result.unwrapOr('default')).toBe('default');
    expect(result.match({ left: (e) => e, right: () => '' })).toBe('Mapped Error: error');
  });

  it('should do nothing when mapping Left on Right', () => {
    const result = pipe(
      new Right(42),
      mapLeft((err) => `Mapped Error: ${err}`)
    );

    expect(result.unwrapOr(0)).toBe(42);
  });

  it('should apply mapLeft to Left with custom error mapping', () => {
    const result = pipe(
      new Left<string, string>('Something went wrong'),
      mapLeft((err) => `Error: ${err}`)
    );

    expect(result.unwrapOr('fallback')).toBe('fallback');
    expect(result.match({ left: (e) => e, right: () => '' })).toBe('Error: Something went wrong');
  });

  it('should not apply mapLeft to Right', () => {
    const result = pipe(
      new Right(100),
      mapLeft((err) => `Error: ${err}`)
    );

    expect(result.unwrapOr(0)).toBe(100);
  });

  it('should match Right with curried match', () => {
    const result = pipe(
      new Right(7),
      match({
        left: () => 'error',
        right: (n) => `value is ${n}`,
      })
    );
    expect(result).toBe('value is 7');
  });

  it('should match Left with curried match', () => {
    const result = pipe(
      new Left<string, number>('Bad Request'),
      match({
        left: (e) => `error: ${e}`,
        right: () => 'success',
      })
    );
    expect(result).toBe('error: Bad Request');
  });

  it('should return true for equal Right values with curried equals', () => {
    const result = pipe(new Right(42), equals(new Right(42)));
    expect(result).toBe(true);
  });

  it('should return false for different Right values with curried equals', () => {
    const result = pipe(new Right(42), equals(new Right(43)));
    expect(result).toBe(false);
  });

  it('should return true for equal Left values with curried equals', () => {
    const result = pipe(new Left('error'), equals(new Left('error')));
    expect(result).toBe(true);
  });

  it('should return false for different Left values with curried equals', () => {
    const result = pipe(new Left('error'), equals(new Left('different error')));
    expect(result).toBe(false);
  });

  it('should return false for different Left and Right values with curried equals', () => {
    const result = pipe(new Left<string, number>('error'), equals(new Right(42)));
    expect(result).toBe(false);
  });

  it('should return false for different Right and Left values with curried equals', () => {
    const result = pipe(new Right<string, number>(42), equals(new Left('error')));
    expect(result).toBe(false);
  });

  it('all should return Right with all values when all are Right', () => {
    const eithers = [right<string, number>(1), right<string, number>(2), right<string, number>(3)];
    const result = all(eithers);
    expect(result.isRight()).toBe(true);
    expect(result.unwrapOr([])).toEqual([1, 2, 3]);
  });

  it('all should return Left with all errors when any are Left', () => {
    const eithers = [right<string, number>(1), left<string, number>('error1'), left<string, number>('error2')];
    const result = all(eithers);
    expect(result.isLeft()).toBe(true);
    expect(result.match({ left: (e) => e, right: (_) => [] })).toEqual(['error1', 'error2']);
  });

  it('all should return Right with empty array for empty input', () => {
    const result = all<string, number>([]);
    expect(result.isRight()).toBe(true);
    expect(result.unwrapOr([])).toEqual([]);
  });

  it('all should collect all errors from multiple Left', () => {
    const eithers = [
      left<string, number>('Name required'),
      left<string, number>('Email invalid'),
      left<string, number>('Age too low'),
    ];
    const result = all(eithers);
    expect(result.match({ left: (e) => e, right: (_) => [] })).toEqual([
      'Name required',
      'Email invalid',
      'Age too low',
    ]);
  });
});
