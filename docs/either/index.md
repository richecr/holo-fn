# `Either<L, R>`

`Either` is used for computations that may fail. It is either a `Left<L>` (error) or a `Right<R>` (success).

```ts
import { Right, Left, tryCatch } from 'holo-fn/either'

const result = new Right<number, number>(10)
  .map(n => n * 2)
  .unwrapOr(0) // 20
```

## Methods

### `map(fn: (value: R) => U): Either<L, U>`
Maps over the `Right` value. Does nothing for `Left`.

### `mapLeft<M>(fn: (err: L) => M): Either<M, R>`
Maps over the `Left` value. Does nothing for `Right`.

### `chain(fn: (value: R) => Either<L, U>): Either<L, U>`
Chains the transformation if the value is `Right`. Returns `Left` otherwise.

### `unwrapOr(defaultValue: R): R`
Returns the value of `Right`, or the default value for `Left`.

### `isRight(): boolean`
Checks if the value is `Right`.

### `isLeft(): boolean`
Checks if the value is `Left`.

### `match<T>(cases: { left: (left: L) => T; right: (right: R) => T }): T`
Matches the value to execute either the `left` or `right` case.

## Helpers

### `tryCatch(fn, onError?)`

Wraps a potentially throwing function in an `Either`.

```ts
import { tryCatch } from 'holo-fn/either'

const parsed = tryCatch(() => JSON.parse(input), e => 'Invalid JSON')
  .map(obj => obj.user)
  .unwrapOr('anonymous')
```

- Returns `Right<R>` if `fn()` succeeds
- Returns `Left<L>` if it throws, using `onError` if provided

---

### `fromPromise(promise, onError?)`

Wraps a `Promise<T>` into a `Promise<Either<L, R>>`.

```ts
import { fromPromise } from 'holo-fn/either'

const result = await fromPromise(fetch('/api'), e => 'Network error')

```

- Resolves to `Right<R>` on success
- Resolves to `Left<L>` on failure

---

### `fromAsync(fn, onError?)`

Same as `fromPromise`, but lazy — receives a function returning a Promise.

```ts
import { fromAsync } from 'holo-fn/either'

const result = await fromAsync(async () => await fetch('/api'), e => 'Request failed')

```

- Allows deferred execution
- Handles exceptions from `async () => ...`

---

## Curried Helpers

### `mapE`

Curried version of `map` for `Either`. This allows functional composition with `pipe`.

```ts
import { mapE } from 'holo-fn/either';

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
import { mapLeftE } from 'holo-fn/either';

const result = pipe(
  new Left("Error"),
  mapLeftE((e) => `Mapped error: ${e}`),
  (res) => res.unwrapOr("No value") 
);

console.log(result); // "Mapped error: Error"
```

---

### `chainE`

Curried version of `chain` for `Either`. This allows chaining transformations on the **Right** value of `Either`, using a functional composition style.

```ts
import { Right, Left, chainE } from 'holo-fn/either';

const double = (n: number) => n * 2;

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
import { unwrapOrE } from 'holo-fn/either';

const result = pipe(
  new Left("Fail"),
  unwrapOrE("No value")
);

console.log(result); // "No value"
```

---

### `matchE`

Curried version of `match` for `Either`. This allows handling `Left` and `Right` in a functional way.

```ts
import { matchE } from 'holo-fn/either';

const result = pipe(
  new Right(10),
  matchE({
    left: (e) => `Error: ${e}`,
    right: (v) => `Success: ${v}`
  })
);

console.log(result); // "Success: 10"
```

---
