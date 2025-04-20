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

### `mapErr(fn: (err: E) => F): Result<T, F>`
Maps over the `Err` value. Does nothing for `Ok`.

### `chain(fn: (value: T) => Result<U, E>): Result<U, E>`
Chains the transformation if the value is `Ok`. Returns `Err` otherwise.

### `unwrapOr(defaultValue: T): T`
Returns the value of `Ok`, or the default value for `Err`.

### `isOk(): boolean`
Checks if the value is `Ok`.

### `isErr(): boolean`
Checks if the value is `Err`.

### `match<T>(cases: { ok: (value: T) => T; err: (err: E) => T }): T`
Matches the value to execute either the `ok` or `err` case.

## Helpers

### `fromThrowable(fn, onError?)`

Wraps a synchronous function in a `Result`.

```ts
import { fromThrowable } from 'holo-fn';

const input = '{"name": "John", "age": 30}'

const result = fromThrowable(() => JSON.parse(input), e => 'Invalid JSON')

console.log(result) // _Ok { value: { name: 'John', age: 30 } }
```

- Returns `Ok<T>` if `fn()` succeeds
- Returns `Err<E>` if it throws, using `onError` if provided

### `fromPromise(promise, onError?)`

Wraps a `Promise<T>` into a `Promise<Result<T, E>>`.

```ts
import { fromPromise } from 'holo-fn/result';

const result = await fromPromise(fetch('/api'), e => 'Network error')

console.log(result) // _Err { error: 'Network error' }
```

- Resolves to `Ok<T>` on success
- Resolves to `Err<E>` on failure

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

### `mapR`

Curried version of the `map` function for `Result`. This allows you to apply a transformation to the **Ok** value in a more functional style.

```ts
import { mapR, Ok } from 'holo-fn/result';

const result = pipe(
  new Ok(5),
  mapR((x) => x * 2),
  (res) => res.unwrapOr(0)
);

console.log(result); // 10
```

---

### `mapErrR`

Curried version of `mapErr` for `Result`. This allows handling errors in a more functional composition style.

```ts
import { Err, mapErrR } from 'holo-fn/result';

const result = pipe(
  new Err("Error"),
  mapErrR((e) => `Mapped error: ${e}`),
  (res) => res.unwrapOr("No value")
);

console.log(result); // "No value"
```

---

### `chainR`

Curried version of `chain` for `Result`. This allows you to chain transformations on the Ok value in a functional pipeline.

```ts
import { chainR, Ok } from 'holo-fn/result';

const result = pipe(
  new Ok(10),
  chainR((x) => new Ok(x + 5)),
  (res) => res.unwrapOr(0)
);

console.log(result); // 15
```

---

### `unwrapOrR`

Curried version of `unwrapOr` for `Result`. This provides a cleaner way to unwrap the value in a `Result`, returning a default value if it's `Err`.

```ts
import { Ok, unwrapOrR } from 'holo-fn/result';

const result = pipe(
  new Ok(42),
  unwrapOrR(0)
);

console.log(result); // 42
```

---

### `matchR`

Curried version of `match` for `Result`. This allows you to handle both `Ok` and `Err` in a functional way, providing a clean way to handle both cases.

```ts
import { matchR, Ok } from 'holo-fn/result';

const result = pipe(
  new Ok(10),
  matchR({
    ok: (v) => `Success: ${v}`,
    err: (e) => `Error: ${e}`
  })
);

console.log(result); // "Success: 10"
```

---
