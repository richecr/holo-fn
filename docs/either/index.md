# `Either<L, R>`

`Either` is used for computations that may fail. It is either a `Left<L>` (error) or a `Right<R>` (success).

```ts
import { Right } from 'holo-fn/either'

const result = new Right(10)
  .map(n => n * 2)
  .unwrapOr(0)

console.log(result); // 20
```

## Methods

### `map(fn: (value: R) => U): Either<L, U>`
Maps over the `Right` value. Does nothing for `Left`.

```ts
import { Either, Left, Right } from "holo-fn/either";

const calculate = (a: number, b: number): Either<string, number> => {
  if (b === 0) {
    return new Left("Division by zero");
  }

  return new Right(a / b);
};

const result1 = calculate(10, 2)
  .map(n => n * 2)
  .unwrapOr(0);

console.log(result1); // 10

const result2 = calculate(10, 0)
  .map(n => n * 2)
  .unwrapOr(0);

console.log(result2); // 0
```

### `mapLeft<M>(fn: (err: L) => M): Either<M, R>`
Maps over the `Left` value. Does nothing for `Right`.

```ts
import { Either, Left, Right } from "holo-fn/either";

const calculate = (a: number, b: number): Either<string, number> => {
  if (b === 0) {
    return new Left("Division by zero");
  }

  return new Right(a / b);
};

const result1 = calculate(10, 2)
  .map(n => n * 2)
  .mapLeft(e => console.log(`Error: ${e}`)) // No printing here
  .unwrapOr(0);

console.log(result1); // 10

const result2 = calculate(10, 0)
  .map(n => n * 2)
  .mapLeft(e => console.log(`Error: ${e}`)) // Prints "Error: Division by zero"
  .unwrapOr(0);

console.log(result2); // 0
```

### `chain(fn: (value: R) => Either<L, U>): Either<L, U>`
Chains the transformation if the value is `Right`. Returns `Left` otherwise.

```ts
import { Either, Left, Right } from "holo-fn/either";

const calculate = (a: number, b: number): Either<string, number> => {
  if (b === 0) {
    return new Left("Division by zero");
  }

  return new Right(a / b);
};

const result1 = calculate(12, 2)
  .chain(n => n > 5 ? new Right(n * 2) : new Left("Result is too small"))
  .map(n => n + 1)
  .mapLeft(e => console.log(`Error: ${e}`)) // Not run
  .unwrapOr(0);


console.log(result1); // 13

const result2 = calculate(10, 2)
  .chain(n => n > 5 ? new Right(n * 2) : new Left("Result is too small"))
  .map(n => n + 1)
  .mapLeft(e => console.log(`Error: ${e}`)) // Prints "Error: Result is too small"
  .unwrapOr(0);

console.log(result2); // 0
```

### `unwrapOr(defaultValue: R): R`
Returns the value of `Right`, or the default value for `Left`.

```ts
import { Either, Left, Right } from "holo-fn/either";

const calculate = (a: number, b: number): Either<string, number> => {
  if (b === 0) {
    return new Left("Division by zero");
  }

  return new Right(a / b);
};

const result1 = calculate(12, 2).unwrapOr(0);
console.log(result1); // 6

const result2 = calculate(10, 0).unwrapOr(-1);
console.log(result2); // -1
```

### `isRight(): boolean`
Checks if the value is `Right`.

```ts
import { Either, Left, Right } from "holo-fn/either";

const calculate = (a: number, b: number): Either<string, number> => {
  if (b === 0) {
    return new Left("Division by zero");
  }

  return new Right(a / b);
};

const result1 = calculate(12, 2).isRight();
console.log(result1); // true

const result2 = calculate(10, 0).isRight();
console.log(result2); // false
```

### `isLeft(): boolean`
Checks if the value is `Left`.

```ts
import { Either, Left, Right } from "holo-fn/either";

const calculate = (a: number, b: number): Either<string, number> => {
  if (b === 0) {
    return new Left("Division by zero");
  }

  return new Right(a / b);
};

const result1 = calculate(12, 2).isLeft();
console.log(result1); // false

const result2 = calculate(10, 0).isLeft();
console.log(result2); // true
```

### `match<T>(cases: { left: (left: L) => T; right: (right: R) => T }): T`
Matches the value to execute either the `left` or `right` case.

```ts
import { Either, Left, Right } from "holo-fn/either";

const calculate = (a: number, b: number): Either<string, number> => {
  if (b === 0) {
    return new Left("Division by zero");
  }

  return new Right(a / b);
};

const result1 = calculate(12, 2)
  .chain(n => n > 5 ? new Right(n * 2) : new Left("Result is too small"))
  .map(n => n + 1)
  .match({
    right: n => n,
    left: e => {
      console.log(`Error: ${e}`); // Not run
      return 0;
    }
  });

console.log(result1); // 13

const result2 = calculate(10, 2)
  .chain(n => n > 5 ? new Right(n * 2) : new Left("Result is too small"))
  .map(n => n + 1)
  .match({
    right: n => n,
    left: e => {
      console.log(`Error: ${e}`); // Prints "Error: Result is too small"
      return 0;
    }
  });

console.log(result2); // 0
```

### `equals(other: Either<L, R>): boolean`
Compares `this` to another `Either`, returns `false` if the values inside are different.

```ts
import { Either, Left, Right } from "holo-fn/either";

const calculate = (a: number, b: number): Either<string, number> => {
  if (b === 0) {
    return new Left("Division by zero");
  }

  return new Right(a / b);
};

const result1 = calculate(12, 2)
  .chain(n => n > 5 ? new Right(n * 2) : new Left("Result is too small"))
  .map(n => n + 1);

console.log(result1.equals(new Right(13))); // true

const result2 = calculate(10, 2)
  .chain(n => n > 5 ? new Right(n * 2) : new Left("Result is too small"))
  .map(n => n + 1);

console.log(result2.equals(new Right(0))); // false

```

## Helpers

### `left<L, R = never>(value: L): Either<L, R>`

Creates a `Left` value, representing an error or failure in an operation.

```ts
import { left } from 'holo-fn/either';

const eitherValue = left<string, string>("Error");
console.log(eitherValue.unwrapOr("No error")); // "No error"
```

---

### `right<L, R>(value: R): Either<L, R>`

Creates a `Right` value, representing a success in an operation.

```ts
import { right } from 'holo-fn/either';

const eitherValue = right(10);
console.log(eitherValue.unwrapOr(0)); // 10
```

---

### `tryCatch(fn, onError?)`

Wraps a potentially throwing function in an `Either`.

```ts
import { tryCatch } from 'holo-fn/either';

const input = '{"name": "John Doe"}'

interface User {
    name: string;
}

const convertToJson = (obj: unknown): User => {
  if (typeof obj === 'object' && obj !== null && 'name' in obj) {
    return obj as User;
  }

  return { name: 'anonymous' };
}

const parsed = tryCatch(() => JSON.parse(input), e => 'Invalid JSON')
  .map(convertToJson)
  .unwrapOr({ name: 'anonymous 1' });

console.log(parsed.name) // John Doe
```

- Returns `Right<R>` if `fn()` succeeds
- Returns `Left<L>` if it throws, using `onError` if provided

---

### `fromPromise(promise, onError?)`

Wraps a `Promise<T>` into a `Promise<Either<L, R>>`.

```ts
import { fromPromise } from 'holo-fn/either'

const result = await fromPromise(fetch('/api'), e => 'Network error')

console.log(result) // _Left { value: 'Network error' }

```

- Resolves to `Right<R>` on success
- Resolves to `Left<L>` on failure

---

### `fromAsync(fn, onError?)`

Same as `fromPromise`, but lazy — receives a function returning a Promise.

```ts
import { fromAsync } from 'holo-fn/either'

const result = await fromAsync(async () => await fetch('/api'), e => 'Request failed')

console.log(result) // _Left { value: 'Request failed' }

```

- Allows deferred execution
- Handles exceptions from `async () => ...`

---

## Curried Helpers

### `mapE`

Curried version of `map` for `Either`. This allows functional composition with `pipe`.

```ts
import { mapE, Right } from 'holo-fn/either';

const result = pipe(
  new Right(5),
  mapE((x) => x * 2),
  (res) => res.unwrapOr(0)
);

console.log(result); // 10
```

---

### `mapLeftE`

Curried version of `mapLeft` for `Either`. This allows mapping over the Left value in a functional pipeline.

```ts
import { Left, mapLeftE } from 'holo-fn/either';

const result = pipe(
  new Left<string, string>("Error"),
  mapLeftE((e) => `Mapped error: ${e}`),
  (res) => res.unwrapOr("No value") 
);

console.log(result); // "No value"
```

---

### `chainE`

Curried version of `chain` for `Either`. This allows chaining transformations on the **Right** value of `Either`, using a functional composition style.

```ts
import { Right, chainE } from 'holo-fn/either';

const result = pipe(
  new Right(5),
  chainE((x) => new Right(x + 5)),
  (res) => res.unwrapOr(0)
);

console.log(result); // 10
```

---

### `unwrapOrE`

Curried version of `unwrapOr` for `Either`. This provides a cleaner way to unwrap the value in a `Either`, returning a default value if it's `Left`.

```ts
import { Left, unwrapOrE } from 'holo-fn/either';

const result = pipe(
  new Left<string, string>("Fail"),
  unwrapOrE("No value")
);

console.log(result); // "No value"
```

---

### `matchE`

Curried version of `match` for `Either`. This allows handling `Left` and `Right` in a functional way.

```ts
import { matchE, Right } from 'holo-fn/either';

const result = pipe(
  new Right<string, number>(10),
  matchE({
    left: (e) => `Error: ${e}`,
    right: (v) => `Success: ${v}`
  })
);

console.log(result); // "Success: 10"
```

---

### `equalsE`

Curried version of `equals` for `Either`. Compares `this` to another `Either`, returns `false` if the values inside are different.

```ts
import { equalsE, Right } from 'holo-fn/either';

const result = pipe(
  new Right(10),
  equalsE(new Right(10))
);

console.log(result); // true
```

---
