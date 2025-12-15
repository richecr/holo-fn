/**
 * Represents a value of one of two possible types: Left or Right.
 * By convention, Right is used for success and Left for failure or alternative values.
 *
 * @template L - The type of the Left value (typically used for errors)
 * @template R - The type of the Right value (typically used for success)
 *
 * @example
 * ```ts
 * const success: Either<string, number> = right(42);
 * const failure: Either<string, number> = left("error");
 * ```
 */
export interface Either<L, R> {
	/**
	 * Returns true if the Either is a Left value.
	 */
	isLeft(): boolean;

	/**
	 * Returns true if the Either is a Right value.
	 */
	isRight(): boolean;

	/**
	 * Applies a function to the value inside Right. Does nothing for Left.
	 *
	 * @param fn - Function to apply to the Right value
	 * @returns A new Either with the transformed Right value
	 *
	 * @example
	 * ```ts
	 * right(5).map(x => x * 2); // Right(10)
	 * left("error").map(x => x * 2); // Left("error")
	 * ```
	 */
	map<U>(fn: (value: R) => U): Either<L, U>;

	/**
	 * Applies a function to the value inside Left. Does nothing for Right.
	 *
	 * @param fn - Function to transform the Left value
	 * @returns A new Either with the transformed Left value
	 *
	 * @example
	 * ```ts
	 * left("fail").mapLeft(e => `Error: ${e}`); // Left("Error: fail")
	 * right(42).mapLeft(e => `Error: ${e}`); // Right(42)
	 * ```
	 */
	mapLeft<M>(fn: (err: L) => M): Either<M, R>;

	/**
	 * Chains an Either-returning function. Useful for sequential operations that may fail.
	 *
	 * @param fn - Function that returns an Either
	 * @returns The result of the function or the original Left
	 *
	 * @example
	 * ```ts
	 * right(5).chain(x => x > 0 ? right(x * 2) : left("negative")); // Right(10)
	 * left("error").chain(x => right(x * 2)); // Left("error")
	 * ```
	 */
	chain<U>(fn: (value: R) => Either<L, U>): Either<L, U>;

	/**
	 * Validates the Right value with a predicate. Converts Right to Left if predicate fails.
	 *
	 * @param predicate - Validation function
	 * @param leftValue - Left value if validation fails
	 * @returns Right if predicate passes, Left otherwise
	 *
	 * @example
	 * ```ts
	 * right(25).validate(x => x >= 18, "Must be 18+"); // Right(25)
	 * right(15).validate(x => x >= 18, "Must be 18+"); // Left("Must be 18+")
	 * ```
	 */
	validate(predicate: (value: R) => boolean, leftValue: L): Either<L, R>;

	/**
	 * Extracts the Right value, or returns the default value for Left.
	 *
	 * @param defaultValue - Value to return if Left
	 * @returns The contained Right value or the default
	 *
	 * @example
	 * ```ts
	 * right(42).unwrapOr(0); // 42
	 * left("error").unwrapOr(0); // 0
	 * ```
	 */
	unwrapOr(defaultValue: R): R;

	/**
	 * Pattern matches on the Either, executing the appropriate branch.
	 *
	 * @param cases - Object with left and right handlers
	 * @returns The result of the matched handler
	 *
	 * @example
	 * ```ts
	 * right(42).match({
	 *   left: e => `Error: ${e}`,
	 *   right: x => `Value: ${x}`
	 * }); // "Value: 42"
	 * ```
	 */
	match<T>(cases: { left: (left: L) => T; right: (right: R) => T }): T;

	/**
	 * Checks if two Either values are equal.
	 *
	 * @param other - Either to compare with
	 * @returns true if both are Left or both are Right with equal values
	 */
	equals(other: Either<L, R>): boolean;

	/**
	 * Extracts the internal value. Use unwrapOr instead for safe extraction.
	 * @internal
	 */
	extract(): L | R;
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
		return new Right(fn(this.value));
	}

	mapLeft<M>(_fn: (err: L) => M): Either<M, R> {
		return new Right(this.value);
	}

	chain<U>(fn: (value: R) => Either<L, U>): Either<L, U> {
		return fn(this.value);
	}

	validate(predicate: (value: R) => boolean, leftValue: L): Either<L, R> {
		return predicate(this.value) ? this : new Left<L, R>(leftValue);
	}

	unwrapOr(_: R): R {
		return this.value;
	}

	match<T>(cases: { left: (left: L) => T; right: (right: R) => T }): T {
		return cases.right(this.value);
	}

	equals(other: Either<L, R>): boolean {
		return other.isRight() ? this.value === other.extract() : false;
	}

	extract(): R {
		return this.value;
	}
}

export class Left<L, R = never> implements Either<L, R> {
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

	validate(_predicate: (value: R) => boolean, _leftValue: L): Either<L, R> {
		return this;
	}

	unwrapOr(defaultValue: R): R {
		return defaultValue;
	}

	match<T>(cases: { left: (left: L) => T; right: (right: R) => T }): T {
		return cases.left(this.value);
	}

	equals(other: Either<L, R>): boolean {
		return other.isLeft() ? this.value === other.extract() : false;
	}

	extract(): L {
		return this.value;
	}
}

/**
 * Wraps a function that may throw an exception into an Either.
 *
 * @param fn - Function that might throw an error
 * @param onError - Optional function to transform the caught error
 * @returns Right if successful, Left if exception is thrown
 *
 * @example
 * ```ts
 * tryCatch(() => JSON.parse('{"a": 1}')); // Right({ a: 1 })
 * tryCatch(() => JSON.parse('invalid')); // Left(SyntaxError)
 * tryCatch(
 *   () => JSON.parse('invalid'),
 *   e => (e as Error).message
 * ); // Left("Unexpected token...")
 * ```
 */
export const tryCatch = <L = unknown, R = unknown>(
	fn: () => R,
	onError?: (e: unknown) => L,
): Either<L, R> => {
	try {
		return new Right<L, R>(fn());
	} catch (e) {
		return new Left<L, R>(onError ? onError(e) : (e as L));
	}
};

/**
 * Wraps a Promise into an Either, handling rejections.
 *
 * @param promise - Promise to wrap
 * @param onError - Optional function to transform the rejection error
 * @returns Promise resolving to Right on success, Left on rejection
 *
 * @example
 * ```ts
 * await fromPromise(Promise.resolve(42)); // Right(42)
 * await fromPromise(Promise.reject(new Error("fail"))); // Left(Error)
 * await fromPromise(
 *   Promise.reject(new Error("fail")),
 *   e => (e as Error).message
 * ); // Left("fail")
 * ```
 */
export const fromPromise = async <L, R>(
	promise: Promise<R>,
	onError?: (e: unknown) => L,
): Promise<Either<L, R>> => {
	try {
		const data = await promise;
		return new Right<L, R>(data);
	} catch (e) {
		return new Left<L, R>(onError ? onError(e) : (e as L));
	}
};

/**
 * Wraps an async function into an Either, handling rejections and exceptions.
 *
 * @param fn - Async function to wrap
 * @param onError - Optional function to transform the error
 * @returns Promise resolving to Right on success, Left on failure
 *
 * @example
 * ```ts
 * await fromAsync(async () => 42); // Right(42)
 * await fromAsync(async () => {
 *   throw new Error("fail");
 * }); // Left(Error)
 * await fromAsync(
 *   async () => { throw new Error("fail"); },
 *   e => (e as Error).message
 * ); // Left("fail")
 * ```
 */
export const fromAsync = async <L, R>(
	fn: () => Promise<R>,
	onError?: (e: unknown) => L,
): Promise<Either<L, R>> => {
	try {
		const data = await fn();
		return new Right<L, R>(data);
	} catch (e) {
		return new Left<L, R>(onError ? onError(e) : (e as L));
	}
};

/**
 * Curried version of map for use in pipelines.
 *
 * @param fn - Function to apply to the Right value
 * @returns A function that takes an Either and returns a mapped Either
 *
 * @example
 * ```ts
 * pipe(right(5), map(x => x * 2)); // Right(10)
 * ```
 */
export const map =
	<L, R, U>(fn: (value: R) => U) =>
	(either: Either<L, R>): Either<L, U> => {
		return either.map(fn);
	};

/**
 * Curried version of mapLeft for use in pipelines.
 *
 * @param fn - Function to transform the Left value
 * @returns A function that takes an Either and returns an Either with transformed Left
 *
 * @example
 * ```ts
 * pipe(left("fail"), mapLeft(e => `Error: ${e}`)); // Left("Error: fail")
 * ```
 */
export const mapLeft =
	<L, M, R>(fn: (err: L) => M) =>
	(either: Either<L, R>): Either<M, R> => {
		return either.mapLeft(fn);
	};

/**
 * Curried version of chain for use in pipelines.
 *
 * @param fn - Function that returns an Either
 * @returns A function that takes an Either and returns the chained result
 *
 * @example
 * ```ts
 * pipe(right(5), chain(x => x > 0 ? right(x * 2) : left("negative"))); // Right(10)
 * ```
 */
export const chain =
	<L, R, U>(fn: (value: R) => Either<L, U>) =>
	(either: Either<L, R>): Either<L, U> => {
		return either.chain(fn);
	};

/**
 * Curried version of validate for use in pipelines.
 *
 * @param predicate - Validation function
 * @param leftValue - Left value if validation fails
 * @returns A function that takes an Either and returns validated Either
 *
 * @example
 * ```ts
 * pipe(right(25), validate(x => x >= 18, "Must be 18+")); // Right(25)
 * ```
 */
export const validate =
	<L, R>(predicate: (value: R) => boolean, leftValue: L) =>
	(either: Either<L, R>): Either<L, R> => {
		return either.validate(predicate, leftValue);
	};

/**
 * Curried version of unwrapOr for use in pipelines.
 *
 * @param defaultValue - Value to return if Left
 * @returns A function that extracts the Right value or returns default
 *
 * @example
 * ```ts
 * pipe(right(42), unwrapOr(0)); // 42
 * ```
 */
export const unwrapOr =
	<L, R>(defaultValue: R) =>
	(either: Either<L, R>): R => {
		return either.unwrapOr(defaultValue);
	};

/**
 * Curried version of match for use in pipelines.
 *
 * @param cases - Object with left and right handlers
 * @returns A function that pattern matches on an Either
 *
 * @example
 * ```ts
 * pipe(right(42), match({ left: e => 0, right: x => x * 2 })); // 84
 * ```
 */
export const match =
	<L, R, T>(cases: { left: (left: L) => T; right: (right: R) => T }) =>
	(either: Either<L, R>): T => {
		return either.match(cases);
	};

/**
 * Curried version of equals for use in pipelines.
 *
 * @param other - Either to compare with
 * @returns A function that checks equality with another Either
 *
 * @example
 * ```ts
 * pipe(right(5), equals(right(5))); // true
 * ```
 */
export const equals =
	<L, R>(other: Either<L, R>) =>
	(either: Either<L, R>): boolean => {
		return either.equals(other);
	};

type UnwrapEitherArray<T extends Either<unknown, unknown>[]> = {
	[K in keyof T]: T[K] extends Either<unknown, infer R> ? R : never;
};

type UnwrapLeftArray<T extends Either<unknown, unknown>[]> = {
	[K in keyof T]: T[K] extends Either<infer L, unknown> ? L : never;
}[number];

type ExtractEitherRight<T> = T extends Either<unknown, infer R> ? R : never;
type ExtractEitherLeft<T> = T extends Either<infer L, unknown> ? L : never;

/**
 * Combines multiple Either values, collecting all Left values.
 * For homogeneous arrays, returns R[] instead of tuples. For mixed types, preserves tuple types.
 *
 * @example
 * ```ts
 * all([right(1), right(2), right(3)]); // Right<number[]>
 * all([right(1), left("e1"), left("e2")]); // Left(["e1", "e2"])
 * all([right(42), right("hello")]); // Right<[number, string]>
 * ```
 */
export function all<
	T extends Either<L, R>,
	L = ExtractEitherLeft<T>,
	R = ExtractEitherRight<T>,
>(eithers: T[]): Either<L[], R[]>;
export function all<T extends Either<unknown, unknown>[]>(
	eithers: [...T],
): Either<UnwrapLeftArray<T>[], UnwrapEitherArray<T>>;
export function all<T extends Either<unknown, unknown>[]>(
	eithers: T,
): Either<unknown, unknown> {
	const values: unknown[] = [];
	const errors: unknown[] = [];

	for (const either of eithers) {
		if (either.isLeft()) {
			errors.push(either.extract());
		} else {
			values.push(either.extract());
		}
	}

	if (errors.length > 0) {
		return new Left(errors);
	}

	return new Right(values);
}

/**
 * Combines multiple Either values with fail-fast behavior.
 * For homogeneous arrays, returns R[] instead of tuples. For mixed types, preserves tuple types.
 *
 * @example
 * ```ts
 * sequence([right(1), right(2), right(3)]); // Right<number[]>
 * sequence([right(1), left("e1"), left("e2")]); // Left("e1") - stops at first
 * sequence([right(42), right("hello")]); // Right<[number, string]>
 * ```
 */
export function sequence<
	T extends Either<L, R>,
	L = ExtractEitherLeft<T>,
	R = ExtractEitherRight<T>,
>(eithers: T[]): Either<L, R[]>;
export function sequence<T extends Either<unknown, unknown>[]>(
	eithers: [...T],
): Either<UnwrapLeftArray<T>, UnwrapEitherArray<T>>;
export function sequence<T extends Either<unknown, unknown>[]>(
	eithers: T,
): Either<unknown, unknown> {
	const values: unknown[] = [];

	for (const either of eithers) {
		if (either.isLeft()) {
			return new Left(either.extract());
		}

		values.push(either.extract());
	}

	return new Right(values);
}

/**
 * Separates an array of Eithers into Left and Right values.
 * For homogeneous arrays, returns R[] instead of tuples. For mixed types, preserves tuple types.
 *
 * @example
 * ```ts
 * partition([right(1), left("e1"), right(2)]);
 * // { lefts: string[], rights: number[] } (not tuples!)
 * ```
 */
export function partition<
	T extends Either<L, R>,
	L = ExtractEitherLeft<T>,
	R = ExtractEitherRight<T>,
>(eithers: T[]): { lefts: L[]; rights: R[] };
export function partition<T extends Either<unknown, unknown>[]>(
	eithers: [...T],
): { lefts: UnwrapLeftArray<T>[]; rights: UnwrapEitherArray<T> };
export function partition<T extends Either<unknown, unknown>[]>(
	eithers: T,
): { lefts: unknown[]; rights: unknown[] } {
	return eithers.reduce(
		(acc, either) => {
			if (either.isLeft()) {
				acc.lefts.push(either.extract());
			} else {
				acc.rights.push(either.extract());
			}
			return acc;
		},
		{
			lefts: [] as unknown[],
			rights: [] as unknown[],
		},
	);
}

/**
 * Creates a Left Either representing a failure or alternative value.
 *
 * @example
 * ```ts
 * left("error"); // Left("error")
 * ```
 */
export const left = <L, R = never>(value: L): Either<L, R> => new Left(value);

/**
 * Creates a Right Either representing a success value.
 *
 * @example
 * ```ts
 * right(42); // Right(42)
 * ```
 */
export const right = <L, R>(value: R): Either<L, R> => new Right(value);
