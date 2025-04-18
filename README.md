# 🧠 holo-fn
![npm](https://img.shields.io/npm/v/holo-fn?style=flat-square)
![types](https://img.shields.io/npm/types/holo-fn?style=flat-square)
![license](https://img.shields.io/npm/l/holo-fn?style=flat-square)
![tests](https://img.shields.io/badge/tests-passing-green?style=flat-square)
![coverage](https://img.shields.io/badge/coverage-100%25-brightgreen?style=flat-square)

**A minimal functional library for TypeScript** featuring **monads** like `Maybe`, `Either` and `Result`. Built for composability and Rambda compatibility.

> 💡 Designed to work seamlessly with `pipe` from Rambda. Fully typed, immutable, and safe by default.

---

## ✨ Features

- ✅ Functional types: `Maybe`, `Either`, `Result`
- ⚙️ Pipe-friendly (Rambda/Ramda compatible)
- 🔒 Immutable by default
- 🧪 100% test coverage
- ⚡️ Zero dependencies
- 🧠 Full TypeScript inference

---

## 🚀 Installation

```bash
npm install holo-fn
```

---

## 📦 API Overview

### `Maybe<T>`

```ts
import { fromNullable } from 'holo-fn/maybe'

const name = fromNullable('Rich')
  .map(n => n.toUpperCase())
  .getOrElse('Anonymous')
```

#### Methods

- `map(fn: (value: T) => U): Maybe<U>`
- `chain(fn: (value: T) => Maybe<U>): Maybe<U>`
- `getOrElse(defaultValue: T): T`
- `isJust(): boolean`
- `isNothing(): boolean`
- `match({ just, nothing })`

#### Helpers

##### fromNullable(value)
Creates a Maybe from a value that might be null or undefined.

```ts
import { fromNullable } from 'holo-fn/maybe'

const maybeEmail = fromNullable(user.email)
```

- Returns `Just<T>` if the value is not `null` or `undefined`
- Returns `Nothing` otherwise


### `Either<L, R>`

```ts
import { Right, Left, tryCatch } from 'holo-fn/either'

const result = new Right<number, number>(10)
  .map(n => n * 2)
  .getOrElse(0) // 20

```

#### Methods

- `map(fn: (value: R) => U): Either<L, U>`
- `chain(fn: (value: R) => Either<L, U>): Either<L, U>`
- `getOrElse(defaultValue: R): R`
- `isRight(): boolean`
- `isLeft(): boolean`
- `match({ left, right }): T`

---

#### Helpers

##### tryCatch(fn, onError?)

Wraps a potentially throwing function in an Either.
```ts
import { tryCatch } from 'holo-fn/either'

const parsed = tryCatch(() => JSON.parse(input), e => 'Invalid JSON')
  .map(obj => obj.user)
  .getOrElse('anonymous')
```

- Returns `Right<R>` if `fn()` succeeds
- Returns `Left<L>` if it throws, using `onError` if provided

---

### `Result<T, E>`

```ts
import { Ok, Err, fromThrowable, fromPromise, fromAsync } from 'holo-fn/result'

const result = new Ok<number, string>(10)
  .map(n => n + 1)
  .unwrapOr(0) // 11
```

#### Methods

- `map(fn: (value: T) => U): Result<U, E>`
- `mapErr(fn: (err: E) => F): Result<T, F>`
- `andThen(fn: (value: T) => Result<U, E>): Result<U, E>`
- `unwrapOr(defaultValue: T): T`
- `isOk(): boolean`
- `isErr(): boolean`
- `match({ ok, err }): U`

---

#### 🧰 Helpers

##### `fromThrowable(fn, onError?)`

Wraps a synchronous function in a `Result`.

```ts
const result = fromThrowable(() => JSON.parse(input), e => 'Invalid JSON')
```

- Returns `Ok<T>` if `fn()` succeeds
- Returns `Err<E>` if it throws, using `onError` if provided

---

##### `fromPromise(promise, onError?)`

Wraps a `Promise<T>` into a `Promise<Result<T, E>>`.

```ts
const result = await fromPromise(fetch('/api'), e => 'Network error')
```

- Resolves to `Ok<T>` on success
- Resolves to `Err<E>` on failure

---

##### `fromAsync(fn, onError?)`

Same as `fromPromise`, but lazy — receives a function returning a Promise.

```ts
const result = await fromAsync(() => fetch('/api'), e => 'Request failed')
```

- Allows deferred execution
- Handles exceptions from `async () => ...`

---

## 🧪 Tests

```bash
npm test
```

### Coverage

```bash
npm run test:cov
```

---

## 🧠 Examples

### Safe object access

```ts
import { fromNullable } from 'holo-fn/maybe'
import { pipe } from 'rambda'

const getUserName = (user: any) =>
  pipe(
    fromNullable(user.profile),
    m => m.chain(p => fromNullable(p.name)),
    m => m.getOrElse('Guest')
  )(user)
```

### Optional parsing

```ts
import { fromNullable } from 'holo-fn/maybe'

const parsePrice = (input: string) =>
  fromNullable(parseFloat(input))
    .map(n => (n > 0 ? n : null))
    .chain(fromNullable)
    .getOrElse(0)
```

---

## 📦 Building

```bash
npm run build
```

---

## 🤝 Contributing

PRs are welcome! Feel free to open issues and contribute new types or enhancements.

---

## 📜 License

MIT
