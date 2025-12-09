# `Result<T, E>`

`Result` is used to represent computations that either succeed with a value (`Ok<T>`) or fail with an error (`Err<E>`).

```ts
import { Ok } from 'holo-fn/result'

const result = new Ok<number, string>(10)
  .map(n => n + 1)
  .unwrapOr(0)

console.log(result) // 11
```

## Methods

### `map(fn: (value: T) => U): Result<U, E>`
Maps over the `Ok` value. Does nothing for `Err`.

```ts
import { Ok, Err } from "holo-fn/result";

const result1 = new Ok(5).map((n) => n * 2);
console.log(result1.unwrapOr(0)); // 10

const result2 = new Err<number, string>("Error").map((n) => n * 2);
console.log(result2.unwrapOr(0)); // 0
```

### `mapErr(fn: (err: E) => F): Result<T, F>`
Maps over the `Err` value. Does nothing for `Ok`.

```ts
import { Ok, Err } from "holo-fn/result";

const result1 = new Ok(10).mapErr((e) => `Error: ${e}`);
console.log(result1.unwrapOr(0)); // 10

const result2 = new Err("Fail").mapErr((e) => `Mapped error: ${e}`);
console.log(result2.unwrapOr(0)); // 0
```

### `chain(fn: (value: T) => Result<U, E>): Result<U, E>`
Chains the transformation if the value is `Ok`. Returns `Err` otherwise.

```ts
import { Ok, Err } from "holo-fn/result";

const result1 = new Ok(5)
  .chain((n) => new Ok(n * 2))
  .unwrapOr(0);
console.log(result1); // 10

const result2 = new Err<number, string>("Error")
  .chain((n) => new Ok(n * 2))
  .unwrapOr(0);
console.log(result2); // 0
```

### `validate(predicate: (value: T) => boolean, error: E): Result<T, E>`
Validates the `Ok` value based on a predicate. If the predicate returns `true`, keeps the value. If it returns `false`, converts to `Err` with the provided error. Does nothing for `Err`.

```ts
import { Ok, Err } from "holo-fn/result";

const result1 = new Ok(25).validate((n) => n >= 18, 'Must be 18+');
console.log(result1.unwrapOr(0)); // 25

const result2 = new Ok(15).validate((n) => n >= 18, 'Must be 18+');
console.log(result2.isErr()); // true

const result3 = new Err<number, string>('Already failed').validate((n) => n >= 18, 'Must be 18+');
console.log(result3.isErr()); // true (keeps original error)
```

### `unwrapOr(defaultValue: T): T`
Returns the value of `Ok`, or the default value for `Err`.

```ts
import { Ok, Err } from "holo-fn/result";

const result1 = new Ok(15).unwrapOr(0);
console.log(result1); // 15

const result2 = new Err("Error").unwrapOr(100);
console.log(result2); // 100
```

### `isOk(): boolean`
Checks if the value is `Ok`.

```ts
import { Ok, Err } from "holo-fn/result";

const result1 = new Ok(5);
console.log(result1.isOk()); // true

const result2 = new Err("Error");
console.log(result2.isOk()); // false
```

### `isErr(): boolean`
Checks if the value is `Err`.

```ts
import { Ok, Err } from "holo-fn/result";

const result1 = new Ok(5);
console.log(result1.isErr()); // false

const result2 = new Err("Error");
console.log(result2.isErr()); // true
```

### `match<T>(cases: { ok: (value: T) => T; err: (err: E) => T }): T`
Matches the value to execute either the `ok` or `err` case.

```ts
import { Ok, Err } from "holo-fn/result";

const result1 = new Ok(10).match({
  ok: (n) => `Success: ${n}`,
  err: (e) => `Failure: ${e}`,
});
console.log(result1); // "Success: 10"

const result2 = new Err("Error").match({
  ok: (n) => `Success: ${n}`,
  err: (e) => `Failure: ${e}`,
});
console.log(result2); // "Failure: Error"
```

### `equals(other: Result<T, E>): boolean`
Compares `this` to another `Result`, returns `false` if the values inside are different.

```ts
import { Ok, Err } from "holo-fn/result";

const result1 = new Ok(10);
console.log(result1.equals(new Ok(10))); // true
console.log(result1.equals(new Ok(20))); // false
console.log(result1.equals(new Err("Error"))); // false


const result2 = new Err("Error");
console.log(result2.equals(new Err("Error"))); // true
console.log(result1.equals(new Err("Error"))); // false
console.log(result2.equals(new Ok(10))); // false
```

## Helpers

### `ok<T, E>(value: T): Result<T, E>`

Creates an `Ok` value, representing the success of an operation with a value.

```ts
import { ok } from 'holo-fn/result';

const resultValue = ok(10);
console.log(resultValue.unwrapOr(0)); // 10
```

---

### `err<T, E>(error: E): Result<T, E>`

Creates an `Err` value, representing a failed operation with an value.

```ts
import { err } from 'holo-fn/result';

const resultValue = err("Error");
console.log(resultValue.unwrapOr("No error")); // "No error"
```

---

### `fromThrowable(fn, onError?)`

Wraps a synchronous function in a `Result`.

```ts
import { fromThrowable } from 'holo-fn/result';

const input = '{"name": "John", "age": 30}'

const result = fromThrowable(() => JSON.parse(input), e => 'Invalid JSON')

console.log(result) // _Ok { value: { name: 'John', age: 30 } }
```

- Returns `Ok<T>` if `fn()` succeeds
- Returns `Err<E>` if it throws, using `onError` if provided

---

### `fromPromise(promise, onError?)`

Wraps a `Promise<T>` into a `Promise<Result<T, E>>`.

```ts
import { fromPromise } from 'holo-fn/result';

const result = await fromPromise(fetch('/api'), e => 'Network error')

console.log(result) // _Err { error: 'Network error' }
```

- Resolves to `Ok<T>` on success
- Resolves to `Err<E>` on failure

---

### `fromAsync(fn, onError?)`

Same as `fromPromise`, but lazy — receives a function returning a Promise.

```ts
import { fromAsync } from 'holo-fn/result';

const result = await fromAsync(() => fetch('/api'), e => 'Request failed')

console.log(result) // _Err { error: 'Request failed' }
```

- Allows deferred execution
- Handles exceptions from `async () => ...`

---

## Curried Helpers

### `map`

Curried version of the `map` function for `Result`. This allows you to apply a transformation to the **Ok** value in a more functional style.

```ts
import { map, Ok } from 'holo-fn/result';

const result = pipe(
  new Ok(5),
  map((x) => x * 2),
  (res) => res.unwrapOr(0)
);

console.log(result); // 10
```

---

### `mapErr`

Curried version of `mapErr` for `Result`. This allows handling errors in a more functional composition style.

```ts
import { Err, mapErr, Ok, Result } from 'holo-fn/result';

const getValue = (value: string | null): Result<string, string> => {
    if (value === null) {
        return new Err("Value is null");
    }
    return new Ok(value);
}

const result = pipe(
  getValue(null),
  mapErr((e) => `Mapped error: ${e}`),
  (res) => res.unwrapOr("No value")
);

console.log(result); // "No value"
```

---

### `chain`

Curried version of `chain` for `Result`. This allows you to chain transformations on the Ok value in a functional pipeline.

```ts
import { chain, Ok } from 'holo-fn/result';

const result = pipe(
  new Ok(10),
  chain((x) => new Ok(x + 5)),
  (res) => res.unwrapOr(0)
);

console.log(result); // 15
```

---

### `validate`

Curried version of `validate` for `Result`. This allows filtering/validating values in a functional pipeline with custom error messages.

```ts
import { ok, validate, unwrapOr } from 'holo-fn/result';

const validateAge = (age: number) =>
  pipe(
    ok<number, string>(age),
    validate((x) => x >= 0, 'Age cannot be negative'),
    validate((x) => x <= 150, 'Age too high'),
    validate((x) => x >= 18, 'Must be 18+'),
    unwrapOr(0)
  );

console.log(validateAge(25)); // 25
console.log(validateAge(15)); // 0 (fails validation)
```

**Common use cases:**

```ts
import { fromThrowable, ok, validate } from "holo-fn/result";
import { pipe } from "remeda";

// Validate email format
const validateEmail = (email: string) =>
  pipe(
    ok<string, string>(email),
    validate((s) => s.length > 0, 'Email is required'),
    validate((s) => s.includes('@'), 'Must contain @'),
    validate((s) => s.includes('.'), 'Invalid domain')
  );

console.log(validateEmail('testexample.com').unwrapOr('Invalid'));

// Parse and validate numbers
const parsePositive = (input: string) =>
  pipe(
    fromThrowable(
      () => parseInt(input, 10),
      () => 'Invalid number'
    ),
    validate((n) => !isNaN(n), 'Not a number'),
    validate((n) => n > 0, 'Must be positive')
  );

console.log(parsePositive('42').unwrapOr(0)); // 42
console.log(parsePositive('-5').unwrapOr(0)); // 0

// Validate objects
type User = { name: string; age: number };
const validateUser = (user: User) =>
  pipe(
    ok<User, string>(user),
    validate((u) => u.name.length > 0, 'Name required'),
    validate((u) => u.age >= 18, 'Must be adult')
  );

console.log(validateUser({ name: 'Alice', age: 30 }).unwrapOr({ name: '', age: 0 }));
console.log(validateUser({ name: '', age: 16 }).unwrapOr({ name: '', age: 0 }));
```

---

### `unwrapOr`

Curried version of `unwrapOr` for `Result`. This provides a cleaner way to unwrap the value in a `Result`, returning a default value if it's `Err`.

```ts
import { Ok, unwrapOr } from 'holo-fn/result';

const result = pipe(
  new Ok(42),
  unwrapOr(0)
);

console.log(result); // 42
```

---

### `match`

Curried version of `match` for `Result`. This allows you to handle both `Ok` and `Err` in a functional way, providing a clean way to handle both cases.

```ts
import { match, Ok } from 'holo-fn/result';

const result = pipe(
  new Ok(10),
  match({
    ok: (v) => `Success: ${v}`,
    err: (e) => `Error: ${e}`
  })
);

console.log(result); // "Success: 10"
```

---

### `equals`

Curried version of `equals` for `Result`. Compares `this` to another `Result`, returns `false` if the values inside are different.

```ts
import { equals, Ok } from 'holo-fn/result';
import { pipe } from 'remeda';

const result1 = pipe(
  new Ok(10),
  equals(new Ok(10)),
);

console.log(result1); // true

const result2 = pipe(
  new Ok(10),
  equals(new Ok(11)),
);

console.log(result2); // false
```

---

### `all`

Combines an array of `Result` values into a single `Result`. Returns `Ok` with all values if all are `Ok`, or `Err` with all errors if any are `Err`.

```ts
import type { Result } from 'holo-fn';
import { all, err, ok } from 'holo-fn/result';

const result1: Result<number[], unknown[]> = all([ok(1), ok(2), ok(3)]);
console.log(result1.unwrapOr([])); // [1, 2, 3]

const result2 = all([err('Name required'), err('Email invalid'), ok(25)]);
console.log(
  result2.match({
    ok: (v) => v,
    err: (e) => e,
  })
); // ['Name required', 'Email invalid']

const result3 = all([]);
console.log(result3.unwrapOr([])); // []
```

---

### `sequence`

Combines an array of `Result` values into a single `Result`, stopping at the first error (fail-fast). Returns `Ok` with all values if all are `Ok`, or `Err` with the first error encountered.

Unlike `all` which collects all errors, `sequence` returns immediately when it finds the first `Err`.

```ts
import type { Result } from 'holo-fn';
import { err, ok, sequence } from 'holo-fn/result';

const result1: Result<number[], unknown> = sequence([ok(1), ok(2), ok(3)]);
console.log(result1.unwrapOr([])); // [1, 2, 3]

const result2 = sequence([
  ok(1),
  err('First error'),
  err('Second error')
]);
console.log(result2.match({
  ok: (v) => v,
  err: (e) => e
})); // 'First error'
```

---

### `partition`

Separates an array of `Result` values into two groups: successes (`oks`) and failures (`errs`). Always processes all items and returns both arrays.

Unlike `all` and `sequence` which return a `Result`, `partition` returns a plain object with two arrays.

```ts
import { err, ok, partition } from 'holo-fn/result';

const results = [
  ok<number, string>(1),
  err<number, string>('error1'),
  ok<number, string>(2),
  err<number, string>('error2'),
  ok<number, string>(3),
];

const { oks, errs } = partition(results);
console.log(oks); // [1, 2, 3]
console.log(errs); // ['error1', 'error2']

const { oks: succeeded, errs: failed } = partition(results);
console.log(`✓ ${succeeded.length} succeeded`);
console.log(`✗ ${failed.length} failed`);
failed.forEach((err) => console.error(err));
```

---

## Common Patterns

### Error handling with specific error types

```ts
import { pipe } from 'rambda';
import { err, match, type Result } from 'holo-fn/result';

type ApiError = 'NOT_FOUND' | 'UNAUTHORIZED' | 'SERVER_ERROR';

type User = {
  id: number;
  name: string;
};

const result: Result<User, ApiError> = err('NOT_FOUND');

const message = pipe(
  result,
  match({
    ok: (user) => `Welcome ${user.name}`,
    err: (e) => {
      switch (e) {
        case 'NOT_FOUND':
          return 'Resource not found';
        case 'UNAUTHORIZED':
          return 'Access denied';
        case 'SERVER_ERROR':
          return 'Server error occurred';
      }
    },
  })
);

console.log(message);
```

### Validation pipelines

```ts
import { pipe } from 'rambda';
import { map, ok, validate } from 'holo-fn/result';

const validateAge = (age: number) =>
  pipe(
    ok<number, string>(age),
    validate((n) => n >= 0, 'Age must be positive'),
    validate((n) => n <= 150, 'Age must be realistic'),
    validate((n) => n >= 18, 'Must be 18 or older'),
    map((n) => ({ age: n, isAdult: true }))
  );

console.log(validateAge(25));
```

---
