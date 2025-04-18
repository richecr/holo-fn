import { Left, Right, tryCatch } from "../src/either";

describe("Either", () => {
  it("Right.map applies function to value", () => {
    const result = new Right<string, number>(10).map((n) => n * 2);
    expect(result.unwrapOr(0)).toBe(20);
  });

  it("should transform Left value", () => {
    const result = new Left<string, number>("fail")
      .mapLeft((msg) => `Error: ${msg}`)
      .match({
        left: (e) => e,
        right: () => "nope",
      });

    expect(result).toBe("Error: fail");
  });

  it("should do nothing when mapping Left on Right", () => {
    const result = new Right<string, number>(42)
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
    const result = new Right<string, number>(5).chain((n) => new Right(n + 3));
    expect(result.unwrapOr(0)).toBe(8);
  });

  it("Left.chain does not call function", () => {
    const result = new Left<string, number>("error").chain(
      (n) => new Right(n + 3)
    );
    expect(result.unwrapOr(0)).toBe(0);
  });

  it("Right.unwrapOr returns the value", () => {
    const result = new Right<string, number>(42);
    expect(result.unwrapOr(0)).toBe(42);
  });

  it("Left.unwrapOr returns default value", () => {
    const result = new Left<string, number>("fail");
    expect(result.unwrapOr(123)).toBe(123);
  });

  it("Right.match calls onRight", () => {
    const result = new Right<string, number>(7).match({
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
