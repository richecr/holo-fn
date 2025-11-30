import { describe, expect, it } from 'bun:test';
import { pipe } from 'rambda';
import { Just, Nothing, chain, equals, filter, fromNullable, just, map, match, nothing, unwrapOr } from '../src/maybe';

describe('Maybe', () => {
  it('Just.isJust() should return true', () => {
    const result = just('x');
    expect(result.isJust()).toBe(true);
  });

  it('should instantiate Nothing explicitly via constructor', () => {
    const instance = new Nothing<number>();
    expect(instance.isNothing()).toBe(true);
  });

  it('Just.isNothing() should return false', () => {
    const result = just<string>('x');
    expect(result.isNothing()).toBe(false);
  });

  it('should map over Just', () => {
    const result = new Just(10).map((x) => x + 5);
    expect(result.unwrapOr(0)).toBe(15);
  });

  it('should return default for Nothing', () => {
    const result = nothing<number>().map((x) => x + 5);
    expect(result.unwrapOr(42)).toBe(42);
  });

  it('Nothing.isJust()  should return false', () => {
    const result = new Nothing();
    expect(result.isJust()).toBe(false);
  });

  it('should support chaining Just values', () => {
    const result = new Just(2).chain((x) => new Just(x * 10));
    expect(result.unwrapOr(0)).toBe(20);
  });

  it('Nothing.chain() should return other Nothing', () => {
    const result = new Nothing<number>().chain((x) => new Just(x * 2));
    expect(result.isNothing()).toBe(true);
  });

  it('should keep Just value when predicate returns true', () => {
    const result = new Just(10).filter((x) => x > 5);
    expect(result.isJust()).toBe(true);
    expect(result.unwrapOr(0)).toBe(10);
  });

  it('should convert Just to Nothing when predicate returns false', () => {
    const result = new Just(3).filter((x) => x > 5);
    expect(result.isNothing()).toBe(true);
    expect(result.unwrapOr(0)).toBe(0);
  });

  it('should keep Nothing as Nothing regardless of predicate', () => {
    const result = new Nothing<number>().filter((x) => x > 5);
    expect(result.isNothing()).toBe(true);
  });

  it('should filter with multiple conditions', () => {
    const result = new Just(25).filter((x) => x >= 18).filter((x) => x <= 100);
    expect(result.unwrapOr(0)).toBe(25);
  });

  it('should filter with regex pattern', () => {
    const result1 = just('abc123').filter((s) => /^[a-z]+$/.test(s));
    expect(result1.isNothing()).toBe(true);

    const result2 = just('abc').filter((s) => /^[a-z]+$/.test(s));
    expect(result2.unwrapOr('')).toBe('abc');
  });

  it('match should dispatch to correct branch', () => {
    const justMsg = new Just('value').match({
      just: (v) => `We have ${v}`,
      nothing: () => 'nothing here',
    });
    const nothingMsg = new Nothing().match({
      just: (v) => `We have ${v}`,
      nothing: () => 'nothing here',
    });

    expect(justMsg).toBe('We have value');
    expect(nothingMsg).toBe('nothing here');
  });

  it('should check equality between Just and Nothing', () => {
    const just1 = new Just(10);
    const just2 = new Just(10);
    const nothing1 = new Nothing<number>();
    const nothing2 = new Nothing<number>();

    expect(just1.equals(just2)).toBe(true);
    expect(just1.equals(nothing1)).toBe(false);
    expect(nothing1.equals(nothing2)).toBe(true);
  });

  it('should check equality with different values', () => {
    const just1 = new Just(10);
    const just2 = new Just(20);
    const nothing1 = new Nothing<number>();
    const nothing2 = new Nothing<number>();

    expect(just1.equals(just2)).toBe(false);
    expect(just1.equals(nothing1)).toBe(false);
    expect(nothing1.equals(nothing2)).toBe(true);
    expect(nothing1.equals(just1)).toBe(false);
  });
});

describe('Maybe fromNullable', () => {
  it('fromNullable should wrap non-null value in Just', () => {
    const maybe = fromNullable('hello');
    expect(maybe.isJust()).toBe(true);
    expect(maybe.unwrapOr('fallback')).toBe('hello');
  });

  it('fromNullable should return Nothing for null or undefined', () => {
    expect(fromNullable(null).isNothing()).toBe(true);
    expect(fromNullable(undefined).isNothing()).toBe(true);
  });
});

describe('Maybe - Curried Helpers', () => {
  it('should apply curried map function to Just', () => {
    const result = pipe(
      new Just(10),
      map((x) => x + 5),
      unwrapOr(0)
    );
    expect(result).toBe(15);
  });

  it('should not apply map to Nothing (curried)', () => {
    const result = pipe(
      new Nothing<number>(),
      map((x) => x + 5),
      unwrapOr(42)
    );
    expect(result).toBe(42);
  });

  it('should chain Just values with curried chain', () => {
    const result = pipe(
      new Just(2),
      chain((x) => new Just(x * 10)),
      unwrapOr(0)
    );
    expect(result).toBe(20);
  });

  it('should return Nothing when chaining from Nothing (curried)', () => {
    const result = pipe(
      new Nothing<number>(),
      chain((x) => new Just(x * 10)),
      unwrapOr(0)
    );
    expect(result).toBe(0);
  });

  it('should work with curried filter in pipe', () => {
    const result = pipe(
      just(42),
      filter((x) => x > 0),
      filter((x) => x % 2 === 0),
      unwrapOr(0)
    );
    expect(result).toBe(42);
  });

  it('should filter and map together in pipe', () => {
    const result = pipe(
      just(5),
      filter((x) => x > 0),
      map((x) => x * 2),
      filter((x) => x > 5),
      unwrapOr(0)
    );
    expect(result).toBe(10);
  });

  it('should handle complex filtering scenarios', () => {
    const validateAge = (age: number) =>
      just(age)
        .filter((x) => x >= 0)
        .filter((x) => x <= 150)
        .filter((x) => x >= 18);

    expect(validateAge(25).unwrapOr(0)).toBe(25);
    expect(validateAge(15).unwrapOr(0)).toBe(0);
    expect(validateAge(-5).unwrapOr(0)).toBe(0);
    expect(validateAge(200).unwrapOr(0)).toBe(0);
  });

  it('should filter objects by properties', () => {
    const user = { name: 'John', age: 30 };
    const result = just(user)
      .filter((u) => u.age >= 18)
      .filter((u) => u.name.length > 0);
    expect(result.unwrapOr({ name: '', age: 0 })).toEqual(user);
  });

  it('should use curried filter with fromNullable', () => {
    const parsePositive = (input: string | null) =>
      pipe(
        fromNullable(input),
        map((s) => parseInt(s, 10)),
        filter((n) => !isNaN(n)),
        filter((n) => n > 0),
        unwrapOr(0)
      );

    expect(parsePositive('42')).toBe(42);
    expect(parsePositive('-5')).toBe(0);
    expect(parsePositive('abc')).toBe(0);
    expect(parsePositive(null)).toBe(0);
  });

  it('should unwrapOr with default value using curried unwrapOr', () => {
    const result = pipe(new Just(10), unwrapOr(42));
    expect(result).toBe(10);
  });

  it('should return the default value for Nothing using curried unwrapOr', () => {
    const result = pipe(new Nothing<number>(), unwrapOr(42));
    expect(result).toBe(42);
  });

  it('should match Just with curried match', () => {
    const result = pipe(
      new Just('value'),
      match({
        just: (v) => `We have ${v}`,
        nothing: () => 'Nothing here',
      })
    );
    expect(result).toBe('We have value');
  });

  it('should match Nothing with curried match', () => {
    const result = pipe(
      new Nothing(),
      match({
        just: (v) => `We have ${v}`,
        nothing: () => 'Nothing here',
      })
    );
    expect(result).toBe('Nothing here');
  });

  it('should check equality with curried equals', () => {
    const just1 = new Just(10);
    const just2 = new Just(10);
    const nothing1 = new Nothing<number>();
    const nothing2 = new Nothing<number>();

    expect(pipe(just1, equals(just2))).toBe(true);
    expect(pipe(just1, equals(nothing1))).toBe(false);
    expect(pipe(nothing1, equals(nothing2))).toBe(true);
  });

  it('should check extract value from Just', () => {
    const just = new Just(10);
    const result = just.extract();
    expect(result).toBe(10);
  });

  it('should check extract value from Nothing', () => {
    const nothing = new Nothing<number>();
    const result = nothing.extract();
    expect(result).toBeNil();
  });
});
