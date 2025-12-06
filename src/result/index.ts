export interface Result<T, E> {
	isOk(): boolean;
	isErr(): boolean;

	map<U>(fn: (value: T) => U): Result<U, E>;
	mapErr<F>(fn: (err: E) => F): Result<T, F>;
	chain<U>(fn: (value: T) => Result<U, E>): Result<U, E>;
	validate(predicate: (value: T) => boolean, error: E): Result<T, E>;
	unwrapOr(defaultValue: T): T;
	match<U>(cases: { ok: (value: T) => U; err: (err: E) => U }): U;
	equals(other: Result<T, E>): boolean;

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

export const map =
	<T, E, U>(fn: (value: T) => U) =>
	(result: Result<T, E>): Result<U, E> => {
		return result.map(fn);
	};

export const mapErr =
	<T, E, F>(fn: (err: E) => F) =>
	(result: Result<T, E>): Result<T, F> => {
		return result.mapErr(fn);
	};

export const chain =
	<T, E, U>(fn: (value: T) => Result<U, E>) =>
	(result: Result<T, E>): Result<U, E> => {
		return result.chain(fn);
	};

export const validate =
	<T, E>(predicate: (value: T) => boolean, error: E) =>
	(result: Result<T, E>): Result<T, E> => {
		return result.validate(predicate, error);
	};

export const unwrapOr =
	<T, E>(defaultValue: T) =>
	(result: Result<T, E>): T => {
		return result.unwrapOr(defaultValue);
	};

export const match =
	<T, E, U>(cases: { ok: (value: T) => U; err: (err: E) => U }) =>
	(result: Result<T, E>): U => {
		return result.match(cases);
	};

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

export function all<T extends Result<unknown, unknown>[]>(
	results: [...T],
): Result<UnwrapResultArray<T>, UnwrapErrorArray<T>[]> {
	const values: UnwrapResultArray<T>[number][] = [];
	const errors: UnwrapErrorArray<T>[] = [];

	for (const result of results) {
		if (result.isErr()) {
			errors.push(result.extract() as UnwrapErrorArray<T>);
		} else {
			values.push(result.extract() as UnwrapResultArray<T>[number]);
		}
	}

	if (errors.length > 0) {
		return new Err(errors) as Result<
			UnwrapResultArray<T>,
			UnwrapErrorArray<T>[]
		>;
	}

	return new Ok(values) as Result<UnwrapResultArray<T>, UnwrapErrorArray<T>[]>;
}

export function sequence<T extends Result<unknown, unknown>[]>(
	results: [...T],
): Result<UnwrapResultArray<T>, UnwrapErrorArray<T>> {
	const values: UnwrapResultArray<T>[number][] = [];

	for (const result of results) {
		if (result.isErr()) {
			return new Err(result.extract() as UnwrapErrorArray<T>) as Result<
				UnwrapResultArray<T>,
				UnwrapErrorArray<T>
			>;
		}

		values.push(result.extract() as UnwrapResultArray<T>[number]);
	}

	return new Ok(values) as Result<UnwrapResultArray<T>, UnwrapErrorArray<T>>;
}

export function partition<T extends Result<unknown, unknown>[]>(
	results: [...T],
): { oks: UnwrapResultArray<T>; errs: UnwrapErrorArray<T>[] } {
	return results.reduce(
		(acc, result) => {
			if (result.isErr()) {
				acc.errs.push(result.extract() as UnwrapErrorArray<T>);
			} else {
				acc.oks.push(result.extract() as UnwrapResultArray<T>[number]);
			}
			return acc;
		},
		{
			oks: [] as UnwrapResultArray<T>[number][],
			errs: [] as UnwrapErrorArray<T>[],
		},
	) as { oks: UnwrapResultArray<T>; errs: UnwrapErrorArray<T>[] };
}

export const ok = <T, E>(value: T): Result<T, E> => new Ok(value);
export const err = <T, E>(error: E): Result<T, E> => new Err(error);
