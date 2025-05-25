import { describe, expect, it } from 'bun:test';
import { pipe } from 'rambda';
import { Just, Nothing, chain, equals, fromNullable, just, map, match, nothing, unwrapOr } from '../src/maybe';

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
