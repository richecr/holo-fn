import { describe, expect, test } from "bun:test";
import { pipe } from "rambda";
import { left, map as mapEither, right } from "../src/either";
import { just, map as mapMaybe, nothing } from "../src/maybe";
import { err, map as mapResult, ok } from "../src/result";
import { tap } from "../src/utils/tap";

describe("Debug Helpers - tap", () => {
	test("tap should work with Maybe Just", () => {
		let called = false;
		let value = 0;

		const result = pipe(
			just(42),
			tap((x) => {
				called = true;
				value = x.unwrapOr(0);
			}),
		);

		expect(called).toBe(true);
		expect(value).toBe(42);
		expect(result.unwrapOr(0)).toBe(42);
	});

	test("tap should work with Maybe Nothing", () => {
		let called = false;

		const result = pipe(
			nothing<number>(),
			tap(() => {
				called = true;
			}),
		);

		expect(called).toBe(true);
		expect(result.unwrapOr(0)).toBe(0);
	});

	test("tap should work in Maybe pipelines", () => {
		const logs: number[] = [];

		const result = pipe(
			just(10),
			tap((x) => logs.push(x.unwrapOr(0))),
			mapMaybe((x) => x * 2),
			tap((x) => logs.push(x.unwrapOr(0))),
			mapMaybe((x) => x + 5),
			tap((x) => logs.push(x.unwrapOr(0))),
		);

		expect(result.unwrapOr(0)).toBe(25);
		expect(logs).toEqual([10, 20, 25]);
	});
});

describe("Debug Helpers - Result", () => {
	test("tap should work with Result Ok", () => {
		let called = false;
		let value = 0;

		const result = pipe(
			ok<number, string>(42),
			tap((x) => {
				called = true;
				value = x.unwrapOr(0);
			}),
		);

		expect(called).toBe(true);
		expect(value).toBe(42);
		expect(result.unwrapOr(0)).toBe(42);
	});

	test("tap should work with Result Err", () => {
		let called = false;
		let errorMsg = "";

		const result = pipe(
			err<number, string>("error"),
			tap((x) => {
				called = true;
				errorMsg = x.match({ ok: () => "", err: (e) => e });
			}),
		);

		expect(called).toBe(true);
		expect(errorMsg).toBe("error");
		expect(result.unwrapOr(0)).toBe(0);
	});

	test("tap should work in Result pipelines", () => {
		const logs: number[] = [];

		const result = pipe(
			ok<number, string>(10),
			tap((x) => logs.push(x.unwrapOr(0))),
			mapResult((x) => x * 2),
			tap((x) => logs.push(x.unwrapOr(0))),
			mapResult((x) => x + 5),
			tap((x) => logs.push(x.unwrapOr(0))),
		);

		expect(result.unwrapOr(0)).toBe(25);
		expect(logs).toEqual([10, 20, 25]);
	});
});

describe("Debug Helpers - Either", () => {
	test("tap should work with Either Right", () => {
		let called = false;
		let value = 0;

		const result = pipe(
			right<string, number>(42),
			tap((x) => {
				called = true;
				value = x.unwrapOr(0);
			}),
		);

		expect(called).toBe(true);
		expect(value).toBe(42);
		expect(result.unwrapOr(0)).toBe(42);
	});

	test("tap should work with Either Left", () => {
		let called = false;
		let errorMsg = "";

		const result = pipe(
			left<string, number>("error"),
			tap((x) => {
				called = true;
				errorMsg = x.match({ left: (e) => e, right: () => "" });
			}),
		);

		expect(called).toBe(true);
		expect(errorMsg).toBe("error");
		expect(result.unwrapOr(0)).toBe(0);
	});

	test("tap should work in Either pipelines", () => {
		const logs: number[] = [];

		const result = pipe(
			right<string, number>(10),
			tap((x) => logs.push(x.unwrapOr(0))),
			mapEither((x) => x * 2),
			tap((x) => logs.push(x.unwrapOr(0))),
			mapEither((x) => x + 5),
			tap((x) => logs.push(x.unwrapOr(0))),
		);

		expect(result.unwrapOr(0)).toBe(25);
		expect(logs).toEqual([10, 20, 25]);
	});

	test("tap should work with plain values", () => {
		const logs: number[] = [];

		const result = pipe(
			42,
			tap((x) => logs.push(x)),
			(x) => x * 2,
			tap((x) => logs.push(x)),
			(x) => x + 5,
			tap((x) => logs.push(x)),
		);

		expect(result).toBe(89);
		expect(logs).toEqual([42, 84, 89]);
	});

	test("tap should work with arrays", () => {
		const logs: number[] = [];

		const result = pipe(
			[1, 2, 3],
			tap((arr) => logs.push(arr.length)),
			(arr) => arr.map((x) => x * 2),
			tap((arr) => logs.push(arr.length)),
			(arr) => arr.filter((x) => x > 2),
			tap((arr) => logs.push(arr.length)),
		);

		expect(result).toEqual([4, 6]);
		expect(logs).toEqual([3, 3, 2]);
	});
});
