# `Maybe<T>`

`Maybe` is used to represent a value that may or may not exist. It can either be a `Just<T>` or a `Nothing`.

```ts
import { fromNullable } from 'holo-fn/maybe'

const name = fromNullable('Rich')
  .map(n => n.toUpperCase())
  .unwrapOr('Anonymous')

console.log(name) // RICH
```

## Methods

### `map(fn: (value: T) => U): Maybe<U>`
Maps over the `Just` value. Does nothing for `Nothing`.

```ts
import { Just, Nothing } from "holo-fn/maybe";

const result1 = new Just(5).map((n) => n * 2);
console.log(result1.unwrapOr(0)); // 10

const result2 = new Nothing<number>().map((n) => n * 2);
console.log(result2.unwrapOr(0)); // 0
```

### `chain(fn: (value: T) => Maybe<U>): Maybe<U>`
Chains the transformation if the value is `Just`. Returns `Nothing` otherwise.

```ts
import { Just, Nothing } from "holo-fn/maybe";

const result1 = new Just(5).chain((n) => new Just(n * 2));
console.log(result1.unwrapOr(0)); // 10

const result2 = new Nothing<number>().chain((n) => new Just(n * 2));
console.log(result2.unwrapOr(0)); // 0
```

### `unwrapOr(defaultValue: T): T`
Returns the value of `Just`, or the default value for `Nothing`.

```ts
import { Just, Nothing } from "holo-fn/maybe";

const result1 = new Just(10);
console.log(result1.unwrapOr(0)); // 10

const result2 = new Nothing<number>();
console.log(result2.unwrapOr(0)); // 0
```

### `isJust(): boolean`
Checks if the value is `Just`.

```ts
import { Just, Nothing } from "holo-fn/maybe";

const result1 = new Just("value");
console.log(result1.isJust()); // true

const result2 = new Nothing();
console.log(result2.isJust()); // false
```

### `isNothing(): boolean`
Checks if the value is `Nothing`.

```ts
import { Just, Nothing } from "holo-fn/maybe";

const result1 = new Just("value");
console.log(result1.isNothing()); // false

const result2 = new Nothing();
console.log(result2.isNothing()); // true
```

### `match<U>(cases: { just: (value: T) => U; nothing: () => U }): U`
Matches the value to execute either the `just` or `nothing` case.

```ts
import { Just, Nothing } from "holo-fn/maybe";

const result1 = new Just("value").match({
  just: (v) => `Has value: ${v}`,
  nothing: () => "No value",
});
console.log(result1); // "Has value: value"

const result2 = new Nothing().match({
  just: (v) => `Has value: ${v}`,
  nothing: () => "No value",
});
console.log(result2); // "No value"
```

### `equals(other: Maybe<T>): boolean`
Compares the values inside `this` and the other, returns `true` if both are `Nothing` or if the values are equal.

```ts
import { Just, Nothing } from "holo-fn/maybe";

const result1 = new Just("value").chain(v => new Just(v + " modified"));

console.log(result1.equals(new Just("value"))); // false
console.log(result1.equals(new Just("value modified"))); // true

const result2 = new Just("value").chain(v => new Nothing());
console.log(result2.equals(new Nothing())); // true
console.log(result2.equals(new Just("value"))); // false
```

## Helpers

### `just(value: T): Maybe<T>`

Creates a `Just` value with the given value, representing the presence of a value.

```ts
import { just } from 'holo-fn/maybe';

const maybeValue = just('Hello');
console.log(maybeValue.unwrapOr('Default')); // 'Hello'
```

---

### `nothing<T = never>(): Maybe<T>`

Creates a `Nothing` value, representing the absence of a value.

```ts
import { nothing } from 'holo-fn/maybe';

const maybeValue = nothing<string>();
console.log(maybeValue.unwrapOr('Default')); // 'Default'
```

---

### `fromNullable(value)`

Creates a `Maybe` from a value that might be `null` or `undefined`.

```ts
const maybeEmail = fromNullable(user.email)
```

- Returns `Just<T>` if the value is not `null` or `undefined`
- Returns `Nothing` otherwise

---

## Curried Helpers

### `map`

Curried version of `map` for `Maybe`. This allows functional composition with `pipe`.

```ts
import { Just, map } from 'holo-fn/maybe';

const result = pipe(
  new Just(10),
  map((x) => x * 2),
  (res) => res.unwrapOr(0)
);

console.log(result); // 20
```

---

### `chain`

Curried version of `chain` for `Maybe`. This allows chaining transformations in a functional pipeline.

```ts
import { chain, Just } from 'holo-fn/maybe';

const result = pipe(
  new Just(2),
  chain((x) => new Just(x * 10)),
  (res) => res.unwrapOr(0)
);

console.log(result); // 20
```

---

### `unwrapOr`

Curried version of `unwrapOr` for `Maybe`. This provides a cleaner way to unwrap the value in a `Maybe`.

```ts
import { Nothing, unwrapOr } from 'holo-fn/maybe';

const result = pipe(
  new Nothing<string>(),
  unwrapOr("No value")
);

console.log(result); // "No value"
```

---

### `match`

Curried version of `match` for `Maybe`. This allows handling `Just` and `Nothing` in a functional way.

```ts
import { Just, match } from 'holo-fn/maybe';

const result = pipe(
  new Just("hello"),
  match({
    just: (v) => `Got ${v}`,
    nothing: () => "No value"
  })
);

console.log(result); // "Got hello"
```

---

### `equals`

Curried version of `equals` for `Maybe`. Compares the values inside `this` and the other, returns `true` if both are `Nothing` or if the values are equal.

```ts
import { equals, Just } from 'holo-fn/maybe';

const result = pipe(
  new Just(10),
  equals(new Just(10))
);

console.log(result); // true
```

---
