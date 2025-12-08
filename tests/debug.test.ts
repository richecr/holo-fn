import { describe, expect, test } from "bun:test";
import { pipe } from "rambda";
import { left, map as mapEither, right } from "../src/either";
import { just, map as mapMaybe, nothing } from "../src/maybe";
import { err, map as mapResult, ok } from "../src/result";
import { inspect } from "../src/utils/inspect";
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

describe("Debug Helpers - inspect", () => {
	test("inspect should log and return value with label", () => {
		const logs: unknown[][] = [];
		const originalLog = console.log;
		console.log = (...args: unknown[]) => logs.push(args);

		const result = pipe(just(42), inspect("Test value"));

		console.log = originalLog;

		expect(result.unwrapOr(0)).toBe(42);
		expect(logs.length).toBe(1);
		expect(logs[0]?.[0]).toBe("Test value:");
		expect(logs[0]?.[1]).toEqual(just(42));
	});

	test("inspect should log without label", () => {
		const logs: unknown[][] = [];
		const originalLog = console.log;
		console.log = (...args: unknown[]) => logs.push(args);

		const result = pipe(ok<number, string>(100), inspect());

		console.log = originalLog;

		expect(result.unwrapOr(0)).toBe(100);
		expect(logs.length).toBe(1);
		expect(logs[0]?.[0]).toEqual(ok(100));
	});

	test("inspect should work in pipelines with Maybe", () => {
		const logs: unknown[][] = [];
		const originalLog = console.log;
		console.log = (...args: unknown[]) => logs.push(args);

		const result = pipe(
			just(10),
			inspect("Initial"),
			mapMaybe((x) => x * 2),
			inspect("After doubling"),
			mapMaybe((x) => x + 5),
			inspect("Final"),
		);

		console.log = originalLog;

		expect(result.unwrapOr(0)).toBe(25);
		expect(logs.length).toBe(3);
		expect(logs[0]?.[0]).toBe("Initial:");
		expect(logs[1]?.[0]).toBe("After doubling:");
		expect(logs[2]?.[0]).toBe("Final:");
	});

	test("inspect should work with Result", () => {
		const logs: unknown[][] = [];
		const originalLog = console.log;
		console.log = (...args: unknown[]) => logs.push(args);

		const result = pipe(
			ok<number, string>(5),
			inspect("Result value"),
			mapResult((x) => x * 10),
		);

		console.log = originalLog;

		expect(result.unwrapOr(0)).toBe(50);
		expect(logs.length).toBe(1);
		expect(logs[0]?.[0]).toBe("Result value:");
	});

	test("inspect should work with Either", () => {
		const logs: unknown[][] = [];
		const originalLog = console.log;
		console.log = (...args: unknown[]) => logs.push(args);

		const result = pipe(
			right<string, number>(42),
			inspect("Either value"),
			mapEither((x) => x * 2),
		);

		console.log = originalLog;

		expect(result.unwrapOr(0)).toBe(84);
		expect(logs.length).toBe(1);
		expect(logs[0]?.[0]).toBe("Either value:");
	});

	test("inspect should work with plain values", () => {
		const logs: unknown[][] = [];
		const originalLog = console.log;
		console.log = (...args: unknown[]) => logs.push(args);

		const result = pipe(
			{ id: 1, name: "Alice" },
			inspect("User object"),
			(user) => user.name,
		);

		console.log = originalLog;

		expect(result).toBe("Alice");
		expect(logs.length).toBe(1);
		expect(logs[0]?.[0]).toBe("User object:");
		expect(logs[0]?.[1]).toEqual({ id: 1, name: "Alice" });
	});

	test("inspect should work with arrays", () => {
		const logs: unknown[][] = [];
		const originalLog = console.log;
		console.log = (...args: unknown[]) => logs.push(args);

		const result = pipe(
			[1, 2, 3],
			inspect("Initial array"),
			(arr) => arr.map((x) => x * 2),
			inspect("After map"),
		);

		console.log = originalLog;

		expect(result).toEqual([2, 4, 6]);
		expect(logs.length).toBe(2);
		expect(logs[0]?.[0]).toBe("Initial array:");
		expect(logs[0]?.[1]).toEqual([1, 2, 3]);
		expect(logs[1]?.[0]).toBe("After map:");
		expect(logs[1]?.[1]).toEqual([2, 4, 6]);
	});
});
