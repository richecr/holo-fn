/**
 * Represents the result of a computation that may fail: either Ok (success) or Err (failure).
 *
 * @template T - The type of the success value
 * @template E - The type of the error value
 *
 * @example
 * ```ts
 * const success: Result<number, string> = ok(42);
 * const failure: Result<number, string> = err("Something went wrong");
 * ```
 */
export interface Result<T, E> {
	/**
	 * Returns true if the Result is Ok.
	 */
	isOk(): boolean;

	/**
	 * Returns true if the Result is Err.
	 */
	isErr(): boolean;

	/**
	 * Applies a function to the value inside Ok. Does nothing for Err.
	 *
	 * @param fn - Function to apply to the value
	 * @returns A new Result with the transformed value
	 *
	 * @example
	 * ```ts
	 * ok(5).map(x => x * 2); // Ok(10)
	 * err("fail").map(x => x * 2); // Err("fail")
	 * ```
	 */
	map<U>(fn: (value: T) => U): Result<U, E>;

	/**
	 * Applies a function to the error inside Err. Does nothing for Ok.
	 *
	 * @param fn - Function to transform the error
	 * @returns A new Result with the transformed error
	 *
	 * @example
	 * ```ts
	 * err("fail").mapErr(e => `Error: ${e}`); // Err("Error: fail")
	 * ```
	 */
	mapErr<F>(fn: (err: E) => F): Result<T, F>;

	/**
	 * Chains a Result-returning function. Useful for sequential operations that may fail.
	 *
	 * @param fn - Function that returns a Result
	 * @returns The result of the function or the original Err
	 *
	 * @example
	 * ```ts
	 * ok(5).chain(x => x > 0 ? ok(x * 2) : err("negative")); // Ok(10)
	 * ```
	 */
	chain<U>(fn: (value: T) => Result<U, E>): Result<U, E>;

	/**
	 * Validates the value with a predicate. Converts Ok to Err if predicate fails.
	 *
	 * @param predicate - Validation function
	 * @param error - Error value if validation fails
	 * @returns Ok if predicate passes, Err otherwise
	 *
	 * @example
	 * ```ts
	 * ok(25).validate(x => x >= 18, "Must be 18+"); // Ok(25)
	 * ok(15).validate(x => x >= 18, "Must be 18+"); // Err("Must be 18+")
	 * ```
	 */
	validate(predicate: (value: T) => boolean, error: E): Result<T, E>;

	/**
	 * Extracts the value from Ok, or returns the default value for Err.
	 *
	 * @param defaultValue - Value to return if Err
	 * @returns The contained value or the default
	 *
	 * @example
	 * ```ts
	 * ok(42).unwrapOr(0); // 42
	 * err("fail").unwrapOr(0); // 0
	 * ```
	 */
	unwrapOr(defaultValue: T): T;

	/**
	 * Pattern matches on the Result, executing the appropriate branch.
	 *
	 * @param cases - Object with ok and err handlers
	 * @returns The result of the matched handler
	 *
	 * @example
	 * ```ts
	 * ok(42).match({
	 *   ok: x => `Success: ${x}`,
	 *   err: e => `Error: ${e}`
	 * }); // "Success: 42"
	 * ```
	 */
	match<U>(cases: { ok: (value: T) => U; err: (err: E) => U }): U;

	/**
	 * Checks if two Result values are equal.
	 *
	 * @param other - Result to compare with
	 * @returns true if both are Err or both are Ok with equal values
	 */
	equals(other: Result<T, E>): boolean;

	/**
	 * Extracts the internal value. Use unwrapOr instead for safe extraction.
	 * @internal
	 */
	extract(): T | E;
}

export class Ok<T, E> implements Result<T, E> {
	constructor(private readonly value: T) {}

	isOk(): boolean {
		return true;
	}

	isErr(): boolean {
		return false;
	}

	map<U>(fn: (value: T) => U): Result<U, E> {
		return new Ok(fn(this.value));
	}

	mapErr<F>(_: (err: E) => F): Result<T, F> {
		return new Ok(this.value);
	}

	chain<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
		return fn(this.value);
	}

	validate(predicate: (value: T) => boolean, error: E): Result<T, E> {
		return predicate(this.value) ? this : new Err<T, E>(error);
	}

	unwrapOr(_: T): T {
		return this.value;
	}

	match<U>(cases: { ok: (value: T) => U; err: (err: E) => U }): U {
		return cases.ok(this.value);
	}

	equals(other: Result<T, E>): boolean {
		return other.isOk() ? this.value === other.extract() : false;
	}

	extract(): T {
		return this.value;
	}
}

export class Err<T, E> implements Result<T, E> {
	constructor(private readonly error: E) {}

	isOk(): boolean {
		return false;
	}

	isErr(): boolean {
		return true;
	}

	map<U>(_: (value: T) => U): Result<U, E> {
		return new Err<U, E>(this.error);
	}

	mapErr<F>(fn: (err: E) => F): Result<T, F> {
		return new Err<T, F>(fn(this.error));
	}

	chain<U>(_: (value: T) => Result<U, E>): Result<U, E> {
		return new Err<U, E>(this.error);
	}

	validate(_predicate: (value: T) => boolean, _error: E): Result<T, E> {
		return this;
	}

	unwrapOr(defaultValue: T): T {
		return defaultValue;
	}

	match<U>(cases: { ok: (value: T) => U; err: (err: E) => U }): U {
		return cases.err(this.error);
	}

	equals(other: Result<T, E>): boolean {
		return other.isErr() ? this.error === other.extract() : false;
	}

	extract(): E {
		return this.error;
	}
}

/**
 * Wraps a function that may throw into a Result.
 *
 * @param fn - Function that might throw an error
 * @param onError - Optional function to transform the error
 * @returns Ok if successful, Err if exception is thrown
 *
 * @example
 * ```ts
 * fromThrowable(() => JSON.parse('{"a": 1}')); // Ok({ a: 1 })
 * fromThrowable(() => JSON.parse('invalid')); // Err(SyntaxError)
 * fromThrowable(
 *   () => JSON.parse('invalid'),
 *   e => (e as Error).message
 * ); // Err("Unexpected token...")
 * ```
 */
export const fromThrowable = <T, E = unknown>(
	fn: () => T,
	onError?: (e: unknown) => E,
): Result<T, E> => {
	try {
		return new Ok(fn());
	} catch (e) {
		return new Err(onError ? onError(e) : (e as E));
	}
};

/**
 * Wraps a Promise into a Result, handling rejections.
 *
 * @param promise - Promise to wrap
 * @param onError - Optional function to transform the error
 * @returns Promise resolving to Ok on success, Err on rejection
 *
 * @example
 * ```ts
 * await fromPromise(Promise.resolve(42)); // Ok(42)
 * await fromPromise(Promise.reject(new Error("fail"))); // Err(Error)
 * await fromPromise(
 *   Promise.reject(new Error("fail")),
 *   e => (e as Error).message
 * ); // Err("fail")
 * ```
 */
export const fromPromise = async <T, E = unknown>(
	promise: Promise<T>,
	onError?: (e: unknown) => E,
): Promise<Result<T, E>> => {
	try {
		const data = await promise;
		return new Ok<T, E>(data);
	} catch (e) {
		return new Err<T, E>(onError ? onError(e) : (e as E));
	}
};

/**
 * Wraps an async function into a Result, handling rejections and exceptions.
 *
 * @param fn - Async function to wrap
 * @param onError - Optional function to transform the error
 * @returns Promise resolving to Ok on success, Err on failure
 *
 * @example
 * ```ts
 * await fromAsync(async () => 42); // Ok(42)
 * await fromAsync(async () => { throw new Error("fail"); }); // Err(Error)
 * ```
 */
export const fromAsync = async <T, E = unknown>(
	fn: () => Promise<T>,
	onError?: (e: unknown) => E,
): Promise<Result<T, E>> => {
	try {
		const data = await fn();
		return new Ok<T, E>(data);
	} catch (e) {
		return new Err<T, E>(onError ? onError(e) : (e as E));
	}
};

/**
 * Curried version of map for use in pipelines.
 *
 * @example
 * ```ts
 * pipe(ok(5), map(x => x * 2)); // Ok(10)
 * ```
 */
export const map =
	<T, E, U>(fn: (value: T) => U) =>
	(result: Result<T, E>): Result<U, E> => {
		return result.map(fn);
	};

/**
 * Curried version of mapErr for use in pipelines.
 *
 * @example
 * ```ts
 * pipe(err("fail"), mapErr(e => `Error: ${e}`)); // Err("Error: fail")
 * ```
 */
export const mapErr =
	<T, E, F>(fn: (err: E) => F) =>
	(result: Result<T, E>): Result<T, F> => {
		return result.mapErr(fn);
	};

/**
 * Curried version of chain for use in pipelines.
 *
 * @example
 * ```ts
 * pipe(ok(5), chain(x => x > 0 ? ok(x * 2) : err("negative"))); // Ok(10)
 * ```
 */
export const chain =
	<T, E, U>(fn: (value: T) => Result<U, E>) =>
	(result: Result<T, E>): Result<U, E> => {
		return result.chain(fn);
	};

/**
 * Curried version of validate for use in pipelines.
 *
 * @example
 * ```ts
 * pipe(ok(25), validate(x => x >= 18, "Must be 18+")); // Ok(25)
 * ```
 */
export const validate =
	<T, E>(predicate: (value: T) => boolean, error: E) =>
	(result: Result<T, E>): Result<T, E> => {
		return result.validate(predicate, error);
	};

/**
 * Curried version of unwrapOr for use in pipelines.
 *
 * @example
 * ```ts
 * pipe(ok(42), unwrapOr(0)); // 42
 * ```
 */
export const unwrapOr =
	<T, E>(defaultValue: T) =>
	(result: Result<T, E>): T => {
		return result.unwrapOr(defaultValue);
	};

/**
 * Curried version of match for use in pipelines.
 *
 * @example
 * ```ts
 * pipe(ok(42), match({ ok: x => x * 2, err: () => 0 })); // 84
 * ```
 */
export const match =
	<T, E, U>(cases: { ok: (value: T) => U; err: (err: E) => U }) =>
	(result: Result<T, E>): U => {
		return result.match(cases);
	};

/**
 * Curried version of equals for use in pipelines.
 *
 * @example
 * ```ts
 * pipe(ok(5), equals(ok(5))); // true
 * ```
 */
export const equals =
	<T, E>(other: Result<T, E>) =>
	(result: Result<T, E>): boolean => {
		return result.equals(other);
	};

type UnwrapResultArray<T extends Result<unknown, unknown>[]> = {
	[K in keyof T]: T[K] extends Result<infer V, unknown> ? V : never;
};

type UnwrapErrorArray<T extends Result<unknown, unknown>[]> = {
	[K in keyof T]: T[K] extends Result<unknown, infer E> ? E : never;
}[number];

type ExtractResultValue<T> = T extends Result<infer V, unknown> ? V : never;

/**
 * Combines multiple Result values, collecting all errors.
 * Returns Ok with array of values if all succeed, or Err with array of all errors.
 * For homogeneous arrays, returns T[] instead of tuples. For mixed types, preserves tuple types.
 *
 * @param results - Array of Result values
 * @returns Ok with all values, or Err with all errors
 *
 * @example
 * ```ts
 * all([ok(1), ok(2), ok(3)]); // Ok<number[]>
 * all([ok(1), err("e1"), err("e2")]); // Err(["e1", "e2"])
 * all([ok(42), ok("hello"), ok(true)]); // Ok<[number, string, boolean]>
 * ```
 */
export function all<
	T extends Result<V, E>,
	V = ExtractResultValue<T>,
	E = unknown,
>(results: T[]): Result<V[], E[]>;
export function all<T extends Result<unknown, unknown>[]>(
	results: [...T],
): Result<UnwrapResultArray<T>, UnwrapErrorArray<T>[]>;
export function all<T extends Result<unknown, unknown>[]>(
	results: T,
): Result<unknown, unknown> {
	const values: unknown[] = [];
	const errors: unknown[] = [];

	for (const result of results) {
		if (result.isErr()) {
			errors.push(result.extract());
		} else {
			values.push(result.extract());
		}
	}

	if (errors.length > 0) {
		return new Err(errors);
	}

	return new Ok(values);
}

/**
 * Combines multiple Result values with fail-fast behavior.
 * Returns Ok with array of values if all succeed, or the first Err encountered.
 * For homogeneous arrays, returns T[] instead of tuples. For mixed types, preserves tuple types.
 *
 * @param results - Array of Result values
 * @returns Ok with all values, or first Err
 *
 * @example
 * ```ts
 * sequence([ok(1), ok(2), ok(3)]); // Ok<number[]>
 * sequence([ok(1), err("e1"), err("e2")]); // Err("e1") - stops at first error
 * sequence([ok(42), ok("hello")]); // Ok<[number, string]>
 * ```
 */
export function sequence<
	T extends Result<V, E>,
	V = ExtractResultValue<T>,
	E = unknown,
>(results: T[]): Result<V[], E>;
export function sequence<T extends Result<unknown, unknown>[]>(
	results: [...T],
): Result<UnwrapResultArray<T>, UnwrapErrorArray<T>>;
export function sequence<T extends Result<unknown, unknown>[]>(
	results: T,
): Result<unknown, unknown> {
	const values: unknown[] = [];

	for (const result of results) {
		if (result.isErr()) {
			return new Err(result.extract());
		}

		values.push(result.extract());
	}

	return new Ok(values);
}

/**
 * Separates an array of Results into successful values and errors.
 * Always processes all items.
 * For homogeneous arrays, returns T[] instead of tuples. For mixed types, preserves tuple types.
 *
 * @param results - Array of Result values
 * @returns Object with oks and errs arrays
 *
 * @example
 * ```ts
 * partition([ok(1), err("e1"), ok(2), err("e2")]);
 * // { oks: number[], errs: string[] }
 * ```
 */
export function partition<
	T extends Result<V, E>,
	V = ExtractResultValue<T>,
	E = unknown,
>(results: T[]): { oks: V[]; errs: E[] };
export function partition<T extends Result<unknown, unknown>[]>(
	results: [...T],
): { oks: UnwrapResultArray<T>; errs: UnwrapErrorArray<T>[] };
export function partition<T extends Result<unknown, unknown>[]>(
	results: T,
): { oks: unknown[]; errs: unknown[] } {
	return results.reduce(
		(acc, result) => {
			if (result.isErr()) {
				acc.errs.push(result.extract());
			} else {
				acc.oks.push(result.extract());
			}
			return acc;
		},
		{
			oks: [] as unknown[],
			errs: [] as unknown[],
		},
	);
}

/**
 * Creates an Ok Result containing a success value.
 *
 * @param value - The success value
 * @returns Ok Result
 *
 * @example
 * ```ts
 * ok(42); // Ok(42)
 * ```
 */
export const ok = <T, E>(value: T): Result<T, E> => new Ok(value);

/**
 * Creates an Err Result containing an error value.
 *
 * @param error - The error value
 * @returns Err Result
 *
 * @example
 * ```ts
 * err("Something went wrong"); // Err("Something went wrong")
 * ```
 */
export const err = <T, E>(error: E): Result<T, E> => new Err(error);
