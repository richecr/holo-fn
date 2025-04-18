import { Just, Nothing, fromNullable } from "../src/maybe";

describe("Maybe", () => {
  it("should map over Just", () => {
    const result = new Just(10).map((x) => x + 5);
    expect(result.unwrapOr(0)).toBe(15);
  });

  it("Just.isNothing() deve retornar false", () => {
    const result = new Just("x");
    expect(result.isNothing()).toBe(false);
  });

  it("should return default for Nothing", () => {
    const result = new Nothing<number>().map((x) => x + 5);
    expect(result.unwrapOr(42)).toBe(42);
  });

  it("Nothing.isJust() deve retornar false", () => {
    const result = new Nothing();
    expect(result.isJust()).toBe(false);
  });

  it("fromNullable should wrap non-null value in Just", () => {
    const maybe = fromNullable("hello");
    expect(maybe.isJust()).toBe(true);
    expect(maybe.unwrapOr("fallback")).toBe("hello");
  });

  it("fromNullable should return Nothing for null or undefined", () => {
    expect(fromNullable(null).isNothing()).toBe(true);
    expect(fromNullable(undefined).isNothing()).toBe(true);
  });

  it("should support chaining Just values", () => {
    const result = new Just(2).chain((x) => new Just(x * 10));
    expect(result.unwrapOr(0)).toBe(20);
  });

  it("chain em Nothing deve retornar outra Nothing", () => {
    const result = new Nothing<number>().chain((x) => new Just(x * 2));
    expect(result.isNothing()).toBe(true);
  });

  it("match should dispatch to correct branch", () => {
    const justMsg = new Just("value").match({
      just: (v) => `Temos ${v}`,
      nothing: () => "Nada aqui",
    });
    const nothingMsg = new Nothing().match({
      just: (v) => `Temos ${v}`,
      nothing: () => "Nada aqui",
    });

    expect(justMsg).toBe("Temos value");
    expect(nothingMsg).toBe("Nada aqui");
  });
});
