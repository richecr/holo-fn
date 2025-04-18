import { Ok, Err, fromThrowable, fromPromise, fromAsync } from "../src/result";

describe("Result", () => {
  it("Ok.map should apply the function", () => {
    const result = new Ok(2).map((x) => x * 3);
    expect(result.unwrapOr(0)).toBe(6);
  });

  it("Err.map should not apply the function", () => {
    const result = new Err<number, string>("fail").map((x) => x * 3);
    expect(result.unwrapOr(42)).toBe(42);
  });

  it("Ok.mapErr should do nothing", () => {
    const result = new Ok(5).mapErr((e) => `err: ${e}`);
    expect(result.unwrapOr(0)).toBe(5);
  });

  it("Err.mapErr should transform the error", () => {
    const result = new Err<number, string>("fail").mapErr((e) => `${e}ed`);
    expect(result.match({ ok: (_) => "", err: (e) => e })).toBe("failed");
  });

  it("Ok.chain should chain into new Ok", () => {
    const result = new Ok(10).chain((x) => new Ok(x + 5));
    expect(result.unwrapOr(0)).toBe(15);
  });

  it("Err.chain should skip function and stay Err", () => {
    const result = new Err<number, string>("bad").chain((x) => new Ok(x + 1));
    expect(result.unwrapOr(123)).toBe(123);
  });

  it("Ok.unwrapOr should return value", () => {
    expect(new Ok("val").unwrapOr("fallback")).toBe("val");
  });

  it("Err.unwrapOr should return fallback", () => {
    expect(new Err<string, string>("fail").unwrapOr("fallback")).toBe(
      "fallback"
    );
  });

  it("Ok.match should call Ok branch", () => {
    const result = new Ok(10).match({
      ok: (n) => `got ${n}`,
      err: (_) => "error",
    });
    expect(result).toBe("got 10");
  });

  it("Err.match should call Err branch", () => {
    const result = new Err<number, string>("fail").match({
      ok: (_) => "ok",
      err: (e) => `error: ${e}`,
    });
    expect(result).toBe("error: fail");
  });

  it("Ok.isOk returns true, isErr false", () => {
    const result = new Ok(1);
    expect(result.isOk()).toBe(true);
    expect(result.isErr()).toBe(false);
  });

  it("Err.isErr returns true, isOk false", () => {
    const result = new Err("fail");
    expect(result.isErr()).toBe(true);
    expect(result.isOk()).toBe(false);
  });
});

describe("fromThrowable", () => {
  it("fromThrowable should return Ok when function succeeds", () => {
    const result = fromThrowable(() => JSON.parse('{"a": 1}'));
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOr({ a: 0 })).toEqual({ a: 1 });
  });

  it("fromThrowable should return Err when function throws", () => {
    const result = fromThrowable(
      () => JSON.parse("invalid"),
      (e) => (e as Error).message
    );
    expect(result.isErr()).toBe(true);
    expect(result.match({ ok: () => "", err: (e) => e })).toMatch(
      /Unexpected token/
    );
  });

  it("fromThrowable fallback to cast if no error mapper", () => {
    const result = fromThrowable(() => {
      throw new Error("fail");
    });
    expect(result.isErr()).toBe(true);
    expect(
      result.match({ ok: () => "", err: (e) => (e as Error).message })
    ).toBe("fail");
  });
});

describe("fromPromise", () => {
  it("should resolve to Ok on success", async () => {
    const promise = Promise.resolve(42);
    const result = await fromPromise(promise);
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOr(0)).toBe(42);
  });

  it("should resolve to Err on failure", async () => {
    const promise = Promise.reject(new Error("boom"));
    const result = await fromPromise(promise, (e) => (e as Error).message);
    expect(result.isErr()).toBe(true);
    expect(result.match({ ok: () => "", err: (e) => e })).toBe("boom");
  });

  it("should fallback to cast if no onError is provided", async () => {
    const promise = Promise.reject(new Error("fallback error"));
    const result = await fromPromise(promise);
    expect(result.isErr()).toBe(true);
    expect(
      result.match({ ok: () => "", err: (e) => (e as Error).message })
    ).toBe("fallback error");
  });
});

describe("fromAsync", () => {
  it("should resolve to Ok on success", async () => {
    const result = await fromAsync(async () => 10);
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOr(0)).toBe(10);
  });

  it("should resolve to Err on exception", async () => {
    const result = await fromAsync(
      async () => {
        throw new Error("fail");
      },
      (e) => (e as Error).message
    );
    expect(result.isErr()).toBe(true);
    expect(result.match({ ok: () => "", err: (e) => e })).toBe("fail");
  });

  it("should fallback to cast if no onError is provided", async () => {
    const result = await fromAsync(async () => {
      throw new Error("async error");
    });
    expect(result.isErr()).toBe(true);
    expect(
      result.match({ ok: () => "", err: (e) => (e as Error).message })
    ).toBe("async error");
  });
});
