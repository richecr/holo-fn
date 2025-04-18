# `Maybe<T>`

`Maybe` is used to represent a value that may or may not exist. It can either be a `Just<T>` or a `Nothing`.

```ts
import { fromNullable } from 'holo-fn/maybe'

const name = fromNullable('Rich')
  .map(n => n.toUpperCase())
  .unwrapOr('Anonymous')
```

## Methods

- `map(fn: (value: T) => U): Maybe<U>`
- `chain(fn: (value: T) => Maybe<U>): Maybe<U>`
- `unwrapOr(defaultValue: T): T`
- `isJust(): boolean`
- `isNothing(): boolean`
- `match({ just, nothing })`

## Helpers

### `fromNullable(value)`

Creates a `Maybe` from a value that might be `null` or `undefined`.

```ts
const maybeEmail = fromNullable(user.email)
```

- Returns `Just<T>` if the value is not `null` or `undefined`
- Returns `Nothing` otherwise

---