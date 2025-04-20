# `Maybe<T>`

`Maybe` is used to represent a value that may or may not exist. It can either be a `Just<T>` or a `Nothing`.

```ts
import { fromNullable } from 'holo-fn/maybe'

const name = fromNullable('Rich')
  .map(n => n.toUpperCase())
  .unwrapOr('Anonymous')
```

## Methods

### `map(fn: (value: T) => U): Maybe<U>`
Maps over the `Just` value. Does nothing for `Nothing`.

### `chain(fn: (value: T) => Maybe<U>): Maybe<U>`
Chains the transformation if the value is `Just`. Returns `Nothing` otherwise.

### `unwrapOr(defaultValue: T): T`
Returns the value of `Just`, or the default value for `Nothing`.

### `isJust(): boolean`
Checks if the value is `Just`.

### `isNothing(): boolean`
Checks if the value is `Nothing`.

### `match<U>(cases: { just: (value: T) => U; nothing: () => U }): U`
Matches the value to execute either the `just` or `nothing` case.

## Helpers

### `fromNullable(value)`

Creates a `Maybe` from a value that might be `null` or `undefined`.

```ts
const maybeEmail = fromNullable(user.email)
```

- Returns `Just<T>` if the value is not `null` or `undefined`
- Returns `Nothing` otherwise

---

## Curried Helpers

### `mapM`

Curried version of `map` for `Maybe`. This allows functional composition with `pipe`.

```ts
import { mapM } from 'holo-fn/maybe';

const result = pipe(
  new Just(10),
  mapM((x) => x * 2),
  (res) => res.unwrapOr(0)
);

console.log(result); // 20
```

---

### `chainM`

Curried version of `chain` for `Maybe`. This allows chaining transformations in a functional pipeline.

```ts
import { chainM } from 'holo-fn/maybe';

const result = pipe(
  new Just(2),
  chainM((x) => new Just(x * 10)),
  (res) => res.unwrapOr(0)
);

console.log(result); // 20
```

---

### `unwrapOrM`

Curried version of `unwrapOr` for `Maybe`. This provides a cleaner way to unwrap the value in a `Maybe`.

```ts
import { unwrapOrM } from 'holo-fn/maybe';

const result = pipe(
  new Nothing(),
  unwrapOrM("No value")
);

console.log(result); // "No value"
```

---

### `matchM`

Curried version of `match` for `Maybe`. This allows handling `Just` and `Nothing` in a functional way.

```ts
import { matchM } from 'holo-fn/maybe';

const result = pipe(
  new Just("hello"),
  matchM({
    just: (v) => `Got ${v}`,
    nothing: () => "No value"
  })
);

console.log(result); // "Got hello"
```

---
