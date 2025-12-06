import { describe, expect, it } from 'bun:test';
import { pipe } from 'rambda';
import {
  all,
  chain,
  equals,
  Err,
  err,
  fromAsync,
  fromPromise,
  fromThrowable,
  map,
  mapErr,
  match,
  Ok,
  ok,
  partition,
  sequence,
  unwrapOr,
  validate,
} from '../src/result';

describe('Result', () => {
  it('Ok.map should apply the function', () => {
    const result = new Ok(2).map((x) => x * 3);
    expect(result.unwrapOr(0)).toBe(6);
  });

  it('Err.map should not apply the function', () => {
    const result = new Err<number, string>('fail').map((x) => x * 3);
    expect(result.unwrapOr(42)).toBe(42);
  });

  it('Ok.mapErr should do nothing', () => {
    const result = new Ok(5).mapErr((e) => `err: ${e}`);
    expect(result.unwrapOr(0)).toBe(5);
  });

  it('Err.mapErr should transform the error', () => {
    const result = new Err<number, string>('fail').mapErr((e) => `${e}ed`);
    expect(result.match({ ok: (_) => '', err: (e) => e })).toBe('failed');
  });

  it('Ok.chain should chain into new Ok', () => {
    const result = new Ok(10).chain((x) => new Ok(x + 5));
    expect(result.unwrapOr(0)).toBe(15);
  });

  it('Err.chain should skip function and stay Err', () => {
    const result = new Err<number, string>('bad').chain((x) => new Ok(x + 1));
    expect(result.unwrapOr(123)).toBe(123);
  });

  it('Ok.validate should keep value when predicate returns true', () => {
    const result = new Ok(25).validate((x) => x >= 18, 'Must be 18+');
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOr(0)).toBe(25);
  });

  it('Ok.validate should convert to Err when predicate returns false', () => {
    const result = new Ok(15).validate((x) => x >= 18, 'Must be 18+');
    expect(result.isErr()).toBe(true);
    expect(result.match({ ok: (_) => '', err: (e) => e })).toBe('Must be 18+');
  });

  it('Ok.validate should support chaining multiple validations', () => {
    const validateAge = (age: number) =>
      ok<number, string>(age)
        .validate((x) => x >= 0, 'Age cannot be negative')
        .validate((x) => x <= 150, 'Age too high')
        .validate((x) => x >= 18, 'Must be 18+');

    expect(validateAge(25).unwrapOr(0)).toBe(25);
    expect(validateAge(15).match({ ok: (_) => '', err: (e) => e })).toBe('Must be 18+');
    expect(validateAge(-5).match({ ok: (_) => '', err: (e) => e })).toBe('Age cannot be negative');
    expect(validateAge(200).match({ ok: (_) => '', err: (e) => e })).toBe('Age too high');
  });

  it('Ok.unwrapOr should return value', () => {
    expect(new Ok('val').unwrapOr('fallback')).toBe('val');
  });

  it('Err.unwrapOr should return fallback', () => {
    expect(new Err<string, string>('fail').unwrapOr('fallback')).toBe('fallback');
  });

  it('Ok.match should call Ok branch', () => {
    const result = new Ok(10).match({
      ok: (n) => `got ${n}`,
      err: (_) => 'error',
    });
    expect(result).toBe('got 10');
  });

  it('Err.match should call Err branch', () => {
    const result = new Err<number, string>('fail').match({
      ok: (_) => 'ok',
      err: (e) => `error: ${e}`,
    });
    expect(result).toBe('error: fail');
  });

  it('Ok.isOk returns true, isErr false', () => {
    const result = new Ok(1);
    expect(result.isOk()).toBe(true);
    expect(result.isErr()).toBe(false);
  });

  it('Err.isErr returns true, isOk false', () => {
    const result = new Err('fail');
    expect(result.isErr()).toBe(true);
    expect(result.isOk()).toBe(false);
  });

  it('Ok.equals should be equal to another Ok with same value', () => {
    const result1 = new Ok(5);
    const result2 = new Ok(5);
    expect(result1.equals(result2)).toBe(true);
  });

  it('Err.equals should be equal to another Err with same error', () => {
    const result1 = new Err('error');
    const result2 = new Err('error');
    expect(result1.equals(result2)).toBe(true);
  });

  it('Ok.equals should not be equal to Err', () => {
    const result1 = new Ok(5);
    const result2 = new Err<number, string>('error');
    expect(result1.equals(result2)).toBe(false);
  });

  it('Err.equals should not be equal to Ok', () => {
    const result1 = new Err('error');
    const result2 = new Ok<number, string>(5);
    expect(result1.equals(result2)).toBe(false);
  });
});

describe('Result fromThrowable', () => {
  it('fromThrowable should return Ok when function succeeds', () => {
    const result = fromThrowable(() => JSON.parse('{"a": 1}'));
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOr({ a: 0 })).toEqual({ a: 1 });
  });

  it('fromThrowable should return Err when function throws', () => {
    const result = fromThrowable(
      () => JSON.parse('invalid'),
      (e) => (e as Error).message
    );
    expect(result.isErr()).toBe(true);
    expect(result.match({ ok: () => '', err: (e) => e })).toMatch('JSON Parse error: Unexpected identifier "invalid"');
  });

  it('fromThrowable fallback to cast if no error mapper', () => {
    const result = fromThrowable(() => {
      throw new Error('fail');
    });
    expect(result.isErr()).toBe(true);
    expect(
      result.match({
        ok: () => '',
        err: (e) => (e as Error).message,
      })
    ).toBe('fail');
  });
});

describe('Result fromPromise', () => {
  it('should resolve to Ok on success', async () => {
    const promise = Promise.resolve(42);
    const result = await fromPromise(promise);
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOr(0)).toBe(42);
  });

  it('should resolve to Err on failure', async () => {
    const promise = Promise.reject(new Error('boom'));
    const result = await fromPromise(promise, (e) => (e as Error).message);
    expect(result.isErr()).toBe(true);
    expect(result.match({ ok: () => '', err: (e) => e })).toBe('boom');
  });

  it('should fallback to cast if no onError is provided', async () => {
    const promise = Promise.reject(new Error('fallback error'));
    const result = await fromPromise(promise);
    expect(result.isErr()).toBe(true);
    expect(
      result.match({
        ok: () => '',
        err: (e) => (e as Error).message,
      })
    ).toBe('fallback error');
  });
});

describe('Result fromAsync', () => {
  it('should resolve to Ok on success', async () => {
    const result = await fromAsync(async () => 10);
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOr(0)).toBe(10);
  });

  it('should resolve to Err on exception', async () => {
    const result = await fromAsync(
      async () => {
        throw new Error('fail');
      },
      (e) => (e as Error).message
    );
    expect(result.isErr()).toBe(true);
    expect(result.match({ ok: () => '', err: (e) => e })).toBe('fail');
  });

  it('should fallback to cast if no onError is provided', async () => {
    const result = await fromAsync(async () => {
      throw new Error('async error');
    });
    expect(result.isErr()).toBe(true);
    expect(
      result.match({
        ok: () => '',
        err: (e) => (e as Error).message,
      })
    ).toBe('async error');
  });
});

describe('Result - Curried Helpers', () => {
  it('should apply curried map function to Ok', () => {
    const result = pipe(
      new Ok(10),
      map((n) => n * 2),
      unwrapOr(0)
    );
    expect(result).toBe(20);
  });

  it('should not apply map to Err (curried)', () => {
    const result = pipe(
      new Err<number, string>('Error'),
      map((n) => n * 2),
      unwrapOr(0)
    );
    expect(result).toBe(0);
  });

  it('should apply curried mapErr function to Err', () => {
    const result = pipe(
      new Err('initial error'),
      mapErr((err) => `Mapped Error: ${err}`)
    );

    expect(result.unwrapOr('fallback')).toBe('fallback');
    expect(result.match({ ok: (_) => '', err: (e) => e })).toBe('Mapped Error: initial error');
  });

  it('should do nothing when mapping Err on Ok', () => {
    const result = pipe(
      new Ok(10),
      mapErr((err) => `Mapped Error: ${err}`)
    );

    expect(result.unwrapOr(0)).toBe(10);
  });

  it('should transform error using curried mapErr', () => {
    const result = pipe(
      new Err('Something went wrong'),
      mapErr((err) => `Error: ${err}`)
    );

    expect(result.unwrapOr('fallback')).toBe('fallback');
    expect(result.match({ ok: (_) => '', err: (e) => e })).toBe('Error: Something went wrong');
  });

  it('should chain Ok values with curried chain', () => {
    const result = pipe(
      new Ok(5),
      chain((x) => new Ok(x + 5)),
      unwrapOr(0)
    );
    expect(result).toBe(10);
  });

  it('should return Err when chaining from Err (curried)', () => {
    const result = pipe(
      new Err<number, string>('Error'),
      chain((x) => new Ok(x + 5)),
      unwrapOr(0)
    );
    expect(result).toBe(0);
  });

  it('curried validate should work with pipe', () => {
    const result = pipe(
      ok<number, string>(42),
      validate((x) => x > 0, 'Must be positive'),
      validate((x) => x % 2 === 0, 'Must be even'),
      unwrapOr(0)
    );
    expect(result).toBe(42);
  });

  it('curried validate should return Err when validation fails in pipe', () => {
    const result = pipe(
      ok<number, string>(41),
      validate((x) => x > 0, 'Must be positive'),
      validate((x) => x % 2 === 0, 'Must be even'),
      match({ ok: (_) => 'ok', err: (e) => e })
    );
    expect(result).toBe('Must be even');
  });

  it('should unwrapOr with default value using curried unwrapOr', () => {
    const result = pipe(new Ok(10), unwrapOr(42));
    expect(result).toBe(10);
  });

  it('should return default value for Err using curried unwrapOr', () => {
    const result = pipe(new Err<number, string>('Error'), unwrapOr(42));
    expect(result).toBe(42);
  });

  it('should match Ok with curried match', () => {
    const result = pipe(
      new Ok(10),
      match({
        ok: (value) => `Success: ${value}`,
        err: () => 'Error',
      })
    );
    expect(result).toBe('Success: 10');
  });

  it('should match Err with curried match', () => {
    const result = pipe(
      new Err('Something went wrong'),
      match({
        ok: () => 'Success',
        err: (err) => `Error: ${err}`,
      })
    );
    expect(result).toBe('Error: Something went wrong');
  });

  it('should equals with another Ok using curried equals', () => {
    const result = pipe(ok(5), equals(new Ok(5)));
    expect(result).toBe(true);
  });

  it('should not equals with another Ok using curried equals', () => {
    const result = pipe(new Ok(5), equals(new Ok(10)));
    expect(result).toBe(false);
  });

  it('should equals with another Err using curried equals', () => {
    const result = pipe(err('Error'), equals(new Err('Error')));
    expect(result).toBe(true);
  });

  it('should not equals with another Err using curried equals', () => {
    const result = pipe(new Err('Error'), equals(new Err('Different Error')));
    expect(result).toBe(false);
  });

  it('all should return Ok with all values when all are Ok', () => {
    const results = [ok<number, string>(1), ok<number, string>(2), ok<number, string>(3)];
    const result = all(results);
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOr([])).toEqual([1, 2, 3]);
  });

  it('all should return Err with all errors when any are Err', () => {
    const results = [ok<number, string>(1), err<number, string>('error1'), err<number, string>('error2')];
    const result = all(results);
    expect(result.isErr()).toBe(true);
    expect(result.match({ ok: (_) => [], err: (e) => e })).toEqual(['error1', 'error2']);
  });

  it('all should return Ok with empty array for empty input', () => {
    const result = all([]);
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOr([])).toEqual([]);
  });

  it('all should collect all errors from multiple Err', () => {
    const results = [
      err<number, string>('Name required'),
      err<number, string>('Email invalid'),
      err<number, string>('Age too low'),
    ];
    const result = all(results);
    expect(result.match({ ok: (_) => [], err: (e) => e })).toEqual(['Name required', 'Email invalid', 'Age too low']);
  });

  it('sequence should return Ok with all values when all are Ok', () => {
    const results = [ok<number, string>(1), ok<number, string>(2), ok<number, string>(3)];
    const result = sequence(results);
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOr([])).toEqual([1, 2, 3]);
  });

  it('sequence should return first Err when any is Err (fail-fast)', () => {
    const results = [ok<number, string>(1), err<number, string>('error1'), err<number, string>('error2')];
    const result = sequence(results);
    expect(result.isErr()).toBe(true);
    expect(result.match({ ok: (_) => '', err: (e) => e })).toBe('error1');
  });

  it('sequence should return Ok with empty array for empty input', () => {
    const result = sequence([]);
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOr([])).toEqual([]);
  });

  it('sequence should stop at first error unlike all', () => {
    const results = [err<number, string>('First error'), err<number, string>('Second error'), ok<number, string>(1)];
    const result = sequence(results);
    expect(result.match({ ok: (_) => '', err: (e) => e })).toBe('First error');
  });

  it('partition should separate oks and errs', () => {
    const results = [
      ok<number, string>(1),
      err<number, string>('error1'),
      ok<number, string>(2),
      err<number, string>('error2'),
      ok<number, string>(3),
    ];
    const { oks, errs } = partition(results);
    expect(oks).toEqual([1, 2, 3]);
    expect(errs).toEqual(['error1', 'error2']);
  });

  it('partition should return all oks when no errors', () => {
    const results = [ok<number, string>(1), ok<number, string>(2), ok<number, string>(3)];
    const { oks, errs } = partition(results);
    expect(oks).toEqual([1, 2, 3]);
    expect(errs).toEqual([]);
  });

  it('partition should return all errs when all fail', () => {
    const results = [err<number, string>('e1'), err<number, string>('e2'), err<number, string>('e3')];
    const { oks, errs } = partition(results);
    expect(oks).toEqual([]);
    expect(errs).toEqual(['e1', 'e2', 'e3']);
  });

  it('partition should return empty arrays for empty input', () => {
    const { oks, errs } = partition([]);
    expect(oks).toEqual([]);
    expect(errs).toEqual([]);
  });
});
