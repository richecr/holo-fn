# `Result<T, E>`

`Result` is used to represent computations that either succeed with a value (`Ok<T>`) or fail with an error (`Err<E>`).

```ts
import { Ok, Err, fromThrowable, fromPromise, fromAsync } from 'holo-fn/result'

const result = new Ok<number, string>(10)
  .map(n => n + 1)
  .unwrapOr(0) // 11
```

## Methods

- `map(fn: (value: T) => U): Result<U, E>`
- `mapErr(fn: (err: E) => F): Result<T, F>`
- `chain(fn: (value: T) => Result<U, E>): Result<U, E>`
- `unwrapOr(defaultValue: T): T`
- `isOk(): boolean`
- `isErr(): boolean`
- `match({ ok, err }): T`

## Helpers

### `fromThrowable(fn, onError?)`

Wraps a synchronous function in a `Result`.

```ts
const result = fromThrowable(() => JSON.parse(input), e => 'Invalid JSON')
```

- Returns `Ok<T>` if `fn()` succeeds
- Returns `Err<E>` if it throws, using `onError` if provided

### `fromPromise(promise, onError?)`

Wraps a `Promise<T>` into a `Promise<Result<T, E>>`.

```ts
const result = await fromPromise(fetch('/api'), e => 'Network error')
```

- Resolves to `Ok<T>` on success
- Resolves to `Err<E>` on failure

### `fromAsync(fn, onError?)`

Same as `fromPromise`, but lazy — receives a function returning a Promise.

```ts
const result = await fromAsync(() => fetch('/api'), e => 'Request failed')
```

- Allows deferred execution
- Handles exceptions from `async () => ...`

---