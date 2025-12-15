/**
 * Represents an optional value: every Maybe is either Just (contains a value) or Nothing (empty).
 *
 * @template T - The type of the value contained in Just
 *
 * @example
 * ```ts
 * const value: Maybe<number> = just(42);
 * const empty: Maybe<number> = nothing();
 * ```
 */
export interface Maybe<T> {
	/**
	 * Returns true if the Maybe is a Just value.
	 */
	isJust(): boolean;

	/**
	 * Returns true if the Maybe is Nothing.
	 */
	isNothing(): boolean;

	/**
	 * Applies a function to the value inside Just. Does nothing for Nothing.
	 *
	 * @param fn - Function to apply to the value
	 * @returns A new Maybe with the transformed value
	 *
	 * @example
	 * ```ts
	 * just(5).map(x => x * 2); // Just(10)
	 * nothing().map(x => x * 2); // Nothing
	 * ```
	 */
	map<U>(fn: (value: T) => U): Maybe<U>;

	/**
	 * Chains a Maybe-returning function. Useful for sequential operations that may fail.
	 *
	 * @param fn - Function that returns a Maybe
	 * @returns The result of the function or Nothing
	 *
	 * @example
	 * ```ts
	 * just(5).chain(x => x > 0 ? just(x * 2) : nothing()); // Just(10)
	 * ```
	 */
	chain<U>(fn: (value: T) => Maybe<U>): Maybe<U>;

	/**
	 * Validates the value with a predicate. Converts Just to Nothing if predicate fails.
	 *
	 * @param fn - Predicate function
	 * @returns Just if predicate passes, Nothing otherwise
	 *
	 * @example
	 * ```ts
	 * just(25).filter(x => x >= 18); // Just(25)
	 * just(15).filter(x => x >= 18); // Nothing
	 * ```
	 */
	filter(fn: (value: T) => boolean): Maybe<T>;

	/**
	 * Extracts the value from Just, or returns the default value for Nothing.
	 *
	 * @param defaultValue - Value to return if Nothing
	 * @returns The contained value or the default
	 *
	 * @example
	 * ```ts
	 * just(42).unwrapOr(0); // 42
	 * nothing().unwrapOr(0); // 0
	 * ```
	 */
	unwrapOr(defaultValue: T): T;

	/**
	 * Pattern matches on the Maybe, executing the appropriate branch.
	 *
	 * @param cases - Object with just and nothing handlers
	 * @returns The result of the matched handler
	 *
	 * @example
	 * ```ts
	 * just(42).match({
	 *   just: x => `Value: ${x}`,
	 *   nothing: () => 'No value'
	 * }); // "Value: 42"
	 * ```
	 */
	match<U>(cases: { just: (value: T) => U; nothing: () => U }): U;

	/**
	 * Checks if two Maybe values are equal.
	 *
	 * @param other - Maybe to compare with
	 * @returns true if both are Nothing or both are Just with equal values
	 */
	equals(other: Maybe<T>): boolean;

	/**
	 * Extracts the internal value. Use unwrapOr instead for safe extraction.
	 * @internal
	 */
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

	filter(fn: (value: T) => boolean): Maybe<T> {
		return fn(this.value) ? this : new Nothing<T>();
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
	constructor() {
		// Empty constructor for test coverage
	}

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

	filter(_: (value: T) => boolean): Maybe<T> {
		return this;
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

/**
 * Converts a nullable value into a Maybe.
 *
 * @param value - Value that might be null or undefined
 * @returns Just if value exists, Nothing if null or undefined
 *
 * @example
 * ```ts
 * fromNullable(42); // Just(42)
 * fromNullable(null); // Nothing
 * fromNullable(undefined); // Nothing
 * ```
 */
export const fromNullable = <T>(value: T | null | undefined): Maybe<T> => {
	return value == null ? new Nothing<T>() : new Just<T>(value);
};

/**
 * Curried version of map for use in pipelines.
 *
 * @param fn - Function to apply to the value
 * @returns A function that takes a Maybe and returns a mapped Maybe
 *
 * @example
 * ```ts
 * pipe(just(5), map(x => x * 2)); // Just(10)
 * ```
 */
export const map =
	<T, U>(fn: (value: T) => U) =>
	(maybe: Maybe<T>): Maybe<U> => {
		return maybe.map(fn);
	};

/**
 * Curried version of chain for use in pipelines.
 *
 * @param fn - Function that returns a Maybe
 * @returns A function that takes a Maybe and returns the chained result
 *
 * @example
 * ```ts
 * pipe(just(5), chain(x => x > 0 ? just(x * 2) : nothing())); // Just(10)
 * ```
 */
export const chain =
	<T, U>(fn: (value: T) => Maybe<U>) =>
	(maybe: Maybe<T>): Maybe<U> => {
		return maybe.chain(fn);
	};

/**
 * Curried version of filter for use in pipelines.
 *
 * @param fn - Predicate function
 * @returns A function that takes a Maybe and returns filtered Maybe
 *
 * @example
 * ```ts
 * pipe(just(25), filter(x => x >= 18)); // Just(25)
 * ```
 */
export const filter =
	<T>(fn: (value: T) => boolean) =>
	(maybe: Maybe<T>): Maybe<T> => {
		return maybe.filter(fn);
	};

/**
 * Curried version of unwrapOr for use in pipelines.
 *
 * @param defaultValue - Value to return if Nothing
 * @returns A function that extracts the value or returns default
 *
 * @example
 * ```ts
 * pipe(just(42), unwrapOr(0)); // 42
 * ```
 */
export const unwrapOr =
	<T>(defaultValue: T) =>
	(maybe: Maybe<T>): T => {
		return maybe.unwrapOr(defaultValue);
	};

/**
 * Curried version of match for use in pipelines.
 *
 * @param cases - Object with just and nothing handlers
 * @returns A function that pattern matches on a Maybe
 *
 * @example
 * ```ts
 * pipe(just(42), match({ just: x => x * 2, nothing: () => 0 })); // 84
 * ```
 */
export const match =
	<T, U>(cases: { just: (value: T) => U; nothing: () => U }) =>
	(maybe: Maybe<T>): U => {
		return maybe.match(cases);
	};

/**
 * Curried version of equals for use in pipelines.
 *
 * @param other - Maybe to compare with
 * @returns A function that checks equality with another Maybe
 *
 * @example
 * ```ts
 * pipe(just(5), equals(just(5))); // true
 * ```
 */
export const equals =
	<T>(other: Maybe<T>) =>
	(maybe: Maybe<T>): boolean => {
		return maybe.equals(other);
	};

type UnwrapMaybeArray<T extends Maybe<unknown>[]> = {
	[K in keyof T]: T[K] extends Maybe<infer V> ? V : never;
};

type ExtractMaybeValue<T> = T extends Maybe<infer V> ? V : never;

/**
 * Combines multiple Maybe values into a single Maybe containing an array.
 * Returns Nothing if any Maybe is Nothing, otherwise returns Just with all values.
 * For homogeneous arrays, returns T[] instead of tuples. For mixed types, preserves tuple types.
 *
 * @param maybes - Array of Maybe values
 * @returns Just with array of all values, or Nothing if any is Nothing
 *
 * @example
 * ```ts
 * all([just(1), just(2), just(3)]); // Just<number[]>
 * all([just(1), nothing(), just(3)]); // Nothing
 * all([just(42), just("hello"), just(true)]); // Just<[number, string, boolean]>
 * ```
 */
export function all<T extends Maybe<V>, V = ExtractMaybeValue<T>>(
	maybes: T[],
): Maybe<V[]>;
export function all<T extends Maybe<unknown>[]>(
	maybes: [...T],
): Maybe<UnwrapMaybeArray<T>>;
export function all<T extends Maybe<unknown>[]>(maybes: T): Maybe<unknown> {
	const values: unknown[] = [];

	for (const maybe of maybes) {
		if (maybe.isNothing()) {
			return new Nothing();
		}

		values.push(maybe.extract());
	}

	return new Just(values);
}

/**
 * Creates a Just value containing the given value.
 *
 * @param value - The value to wrap
 * @returns A Just containing the value
 *
 * @example
 * ```ts
 * just(42); // Just(42)
 * ```
 */
export const just = <T>(value: T): Maybe<T> => new Just(value);

/**
 * Creates a Nothing value representing the absence of a value.
 *
 * @returns A Nothing instance
 *
 * @example
 * ```ts
 * nothing<number>(); // Nothing
 * ```
 */
export const nothing = <T = never>() => new Nothing<T>();
