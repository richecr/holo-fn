import { pipe } from "rambda";
import { chainE, fromAsync, fromPromise, Left, mapE, mapLeftE, matchE, Right, tryCatch, unwrapOrE } from "../src/either";

describe("Either", () => {
  it("Right.map applies function to value", () => {
    const result = new Right(10).map((n) => n * 2);
    expect(result.unwrapOr(0)).toBe(20);
  });

  it("should transform Left value", () => {
    const result = new Left("fail")
      .mapLeft((msg) => `Error: ${msg}`)
      .match({
        left: (e) => e,
        right: () => "nope",
      });

    expect(result).toBe("Error: fail");
  });

  it("should do nothing when mapping Left on Right", () => {
    const result = new Right(42)
      .mapLeft((msg) => `Error: ${msg}`)
      .match({
        left: () => -1,
        right: (n) => n,
      });

    expect(result).toBe(42);
  });

  it("Left.map does not apply function", () => {
    const result = new Left<string, number>("error").map((n) => n * 2);
    expect(result.unwrapOr(99)).toBe(99);
  });

  it("Right.chain unwraps and applies", () => {
    const result = new Right(5).chain((n) => new Right(n + 3));
    expect(result.unwrapOr(0)).toBe(8);
  });

  it("Left.chain does not call function", () => {
    const result = new Left<string, number>("error").chain(
      (n) => new Right(n + 3)
    );
    expect(result.unwrapOr(0)).toBe(0);
  });

  it("Right.unwrapOr returns the value", () => {
    const result = new Right(42);
    expect(result.unwrapOr(0)).toBe(42);
  });

  it("Left.unwrapOr returns default value", () => {
    const result = new Left("fail");
    expect(result.unwrapOr(123)).toBe(123);
  });

  it("Right.match calls onRight", () => {
    const result = new Right(7).match({
      left: () => "error",
      right: (n) => `value is ${n}`,
    });
    expect(result).toBe("value is 7");
  });

  it("Left.match calls onLeft", () => {
    const result = new Left<string, number>("bad").match({
      left: (e) => `error: ${e}`,
      right: () => "success",
    });
    expect(result).toBe("error: bad");
  });

  it("Right.isRight returns true", () => {
    expect(new Right("x").isRight()).toBe(true);
  });

  it("Left.isRight returns false", () => {
    expect(new Left("x").isRight()).toBe(false);
  });

  it("Right.isLeft returns false", () => {
    expect(new Right("x").isLeft()).toBe(false);
  });

  it("Left.isLeft returns true", () => {
    expect(new Left("x").isLeft()).toBe(true);
  });

  it("tryCatch should return Right when function succeeds", () => {
    const result = tryCatch(() => JSON.parse('{"a":1}'));
    expect(result.isRight()).toBe(true);
  });

  it("tryCatch should return Left when function throws", () => {
    const result = tryCatch(
      () => JSON.parse("{invalid"),
      (e) => `Caught: ${(e as Error).message}`
    );
    expect(result.isLeft()).toBe(true);
    expect(
      result.match({
        left: (e) => e,
        right: () => "",
      })
    ).toMatch(/^Caught:/);
  });

  it("tryCatch should fallback to casting when onError is not provided", () => {
    const result = tryCatch(() => {
      throw new Error("unexpected");
    });
    expect(result.isLeft()).toBe(true);
    expect(
      result.match({
        left: (e) => (e instanceof Error ? e.message : "nope"),
        right: () => "",
      })
    ).toBe("unexpected");
  });
});

describe("Either fromPromise", () => {
  it("should resolve a Promise and return a Right with the result", async () => {
    const result = await fromPromise(Promise.resolve(10), (e) => `Error: ${e}`);
    expect(result.isRight()).toBe(true);
    expect(result.unwrapOr(0)).toBe(10);
  });

  it("should reject a Promise and return a Left with the error", async () => {
    const result = await fromPromise(
      Promise.reject<string>("Network Error"),
      (e) => `Error: ${e}`
    );
    expect(result.isLeft()).toBe(true);
    result.mapLeft((e) => expect(e).toBe("Error: Network Error"));
  });

  it("should map the error in Left when using mapLeft", async () => {
    const result = (await fromPromise(Promise.reject("Network Error"))).mapLeft(
      (error) => `Mapped Error: ${error}`
    );

    expect(result.isLeft()).toBe(true);
    result.mapLeft((error) =>
      expect(error).toBe("Mapped Error: Network Error")
    );
  });
});

describe("Either fromAsync", () => {
  it("should resolve an async function and return a Right with the result", async () => {
    const result = await fromAsync(
      async () => 20,
      (e) => `Error: ${e}`
    );
    expect(result.isRight()).toBe(true);
    expect(result.unwrapOr(0)).toBe(20);
  });

  it("should reject an async function and return a Left with the error", async () => {
    const result = await fromAsync<string, unknown>(
      async () => {
        throw new Error("API Error");
      },
      (e) => `Error: ${(e as Error).message}`
    );
    expect(result.isLeft()).toBe(true);
    result.mapLeft((e) => expect(e).toBe("Error: API Error"));
  });

  it("should map the error in Left when using mapLeft", async () => {
    const result = (
      await fromAsync(async () => {
        throw "API Error";
      })
    ).mapLeft((error) => `Mapped Error: ${error}`);

    expect(result.isLeft()).toBe(true);
    result.mapLeft((error) => expect(error).toBe("Mapped Error: API Error"));
  });
});

describe("Either - Curried Helpers", () => {
  it("should apply curried map function to Right", () => {
    const result = pipe(
      new Right(10),
      mapE((n) => n * 2),
      unwrapOrE(0)
    );
    expect(result).toBe(20);
  });

  it("should not apply map to Left (curried)", () => {
    const result = pipe(
      new Left<string, number>("Error"),
      mapE((n) => n * 2),
      unwrapOrE(0)
    );
    expect(result).toBe(0);
  });

  it("should chain Right values with curried chain", () => {
    const result = pipe(
      new Right(2),
      chainE((x) => new Right(x * 10)),
      unwrapOrE(0)
    );
    expect(result).toBe(20);
  });

  it("should return Left when chaining from Left (curried)", () => {
    const result = pipe(
      new Left<string, number>("Error"),
      chainE((x) => new Right(x * 10)),
      unwrapOrE(0)
    );
    expect(result).toBe(0);
  });

  it("should unwrapOr with default value using curried unwrapOr", () => {
    const result = pipe(
      new Right(10),
      unwrapOrE(42)
    );
    expect(result).toBe(10);
  });

  it("should return default value for Left using curried unwrapOr", () => {
    const result = pipe(
      new Left<string, number>("Error"),
      unwrapOrE(42)
    );
    expect(result).toBe(42);
  });

  it("should apply curried mapLeft function to Left", () => {
    const result = pipe(
      new Left("error"),
      mapLeftE((err) => `Mapped Error: ${err}`)
    );

    expect(result.unwrapOr("default")).toBe("default");
    expect(result.match({ left: (e) => e, right: () => "" })).toBe("Mapped Error: error");
  });

  it("should do nothing when mapping Left on Right", () => {
    const result = pipe(
      new Right(42),
      mapLeftE((err) => `Mapped Error: ${err}`)
    );

    expect(result.unwrapOr(0)).toBe(42);
  });

  it("should apply mapLeft to Left with custom error mapping", () => {
    const result = pipe(
      new Left("Something went wrong"),
      mapLeftE((err) => `Error: ${err}`)
    );

    expect(result.unwrapOr("fallback")).toBe("fallback");
    expect(result.match({ left: (e) => e, right: () => "" })).toBe("Error: Something went wrong");
  });

  it("should not apply mapLeft to Right", () => {
    const result = pipe(
      new Right(100),
      mapLeftE((err) => `Error: ${err}`)
    );

    expect(result.unwrapOr(0)).toBe(100);
  });

  it("should match Right with curried match", () => {
    const result = pipe(
      new Right(7),
      matchE({
        left: () => "error",
        right: (n) => `value is ${n}`,
      })
    );
    expect(result).toBe("value is 7");
  });

  it("should match Left with curried match", () => {
    const result = pipe(
      new Left<string, number>("Bad Request"),
      matchE({
        left: (e) => `error: ${e}`,
        right: () => "success",
      })
    );
    expect(result).toBe("error: Bad Request");
  });
});
