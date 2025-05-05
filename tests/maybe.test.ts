import { pipe } from "rambda";
import { Just, Nothing, fromNullable, chainM, mapM, unwrapOrM, matchM } from "../src/maybe";
import { equalsM, just, nothing } from "../src/maybe/Maybe";

describe("Maybe", () => {
  it("should map over Just", () => {
    const result = new Just(10).map((x) => x + 5);
    expect(result.unwrapOr(0)).toBe(15);
  });

  it("Just.isNothing() deve retornar false", () => {
    const result = just("x");
    expect(result.isNothing()).toBe(false);
  });

  it("should return default for Nothing", () => {
    const result = nothing<number>().map((x) => x + 5);
    expect(result.unwrapOr(42)).toBe(42);
  });

  it("Nothing.isJust() deve retornar false", () => {
    const result = new Nothing();
    expect(result.isJust()).toBe(false);
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

  it("should check equality between Just and Nothing", () => {
    const just1 = new Just(10);
    const just2 = new Just(10);
    const nothing1 = new Nothing<number>();
    const nothing2 = new Nothing<number>();

    expect(just1.equals(just2)).toBe(true);
    expect(just1.equals(nothing1)).toBe(false);
    expect(nothing1.equals(nothing2)).toBe(true);
  });

  it("should check equality with different values", () => {
    const just1 = new Just(10);
    const just2 = new Just(20);
    const nothing1 = new Nothing<number>();
    const nothing2 = new Nothing<number>();

    expect(just1.equals(just2)).toBe(false);
    expect(just1.equals(nothing1)).toBe(false);
    expect(nothing1.equals(nothing2)).toBe(true);
  });
});

describe("Maybe fromNullable", () => {
  it("fromNullable should wrap non-null value in Just", () => {
    const maybe = fromNullable("hello");
    expect(maybe.isJust()).toBe(true);
    expect(maybe.unwrapOr("fallback")).toBe("hello");
  });

  it("fromNullable should return Nothing for null or undefined", () => {
    expect(fromNullable(null).isNothing()).toBe(true);
    expect(fromNullable(undefined).isNothing()).toBe(true);
  });
});

describe("Maybe - Curried Helpers", () => {
  it("should apply curried map function to Just", () => {
    const result = pipe(
      new Just(10),
      mapM((x) => x + 5),
      unwrapOrM(0)
    );
    expect(result).toBe(15);
  });

  it("should not apply map to Nothing (curried)", () => {
    const result = pipe(
      new Nothing<number>(),
      mapM((x) => x + 5),
      unwrapOrM(42)
    );
    expect(result).toBe(42);
  });

  it("should chain Just values with curried chain", () => {
    const result = pipe(
      new Just(2),
      chainM((x) => new Just(x * 10)),
      unwrapOrM(0)
    );
    expect(result).toBe(20);
  });

  it("should return Nothing when chaining from Nothing (curried)", () => {
    const result = pipe(
      new Nothing<number>(),
      chainM((x) => new Just(x * 10)),
      unwrapOrM(0)
    );
    expect(result).toBe(0);
  });

  it("should unwrapOr with default value using curried unwrapOr", () => {
    const result = pipe(
      new Just(10),
      unwrapOrM(42)
    );
    expect(result).toBe(10);
  });

  it("should return the default value for Nothing using curried unwrapOr", () => {
    const result = pipe(
      new Nothing<number>(),
      unwrapOrM(42)
    );
    expect(result).toBe(42);
  });

  it("should match Just with curried match", () => {
    const result = pipe(
      new Just("value"),
      matchM({
        just: (v) => `Temos ${v}`,
        nothing: () => "Nada aqui",
      })
    );
    expect(result).toBe("Temos value");
  });

  it("should match Nothing with curried match", () => {
    const result = pipe(
      new Nothing(),
      matchM({
        just: (v) => `Temos ${v}`,
        nothing: () => "Nada aqui",
      })
    );
    expect(result).toBe("Nada aqui");
  });

  it("should check equality with curried equals", () => {
    const just1 = new Just(10);
    const just2 = new Just(10);
    const nothing1 = new Nothing<number>();
    const nothing2 = new Nothing<number>();

    expect(pipe(just1, equalsM(just2))).toBe(true);
    expect(pipe(just1, equalsM(nothing1))).toBe(false);
    expect(pipe(nothing1, equalsM(nothing2))).toBe(true);
  });

  it("should check extract value from Just", () => {
    const just = new Just(10);
    const result = just.extract();
    expect(result).toBe(10);
  });

  it("should check extract value from Nothing", () => {
    const nothing = new Nothing<number>();
    const result = nothing.extract();
    expect(result).toBe(undefined);
  });
});


