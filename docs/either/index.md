# `Either<L, R>`

`Either` is used for computations that may fail. It is either a `Left<L>` (error) or a `Right<R>` (success).

```ts
import { Right, Left, tryCatch } from 'holo-fn/either'

const result = new Right<number, number>(10)
  .map(n => n * 2)
  .unwrapOr(0) // 20
```

## Methods

- `map(fn: (value: R) => U): Either<L, U>`
- `chain(fn: (value: R) => Either<L, U>): Either<L, U>`
- `unwrapOr(defaultValue: R): R`
- `isRight(): boolean`
- `isLeft(): boolean`
- `match({ left, right }): T`

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