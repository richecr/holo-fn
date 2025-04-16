# 🧠 holo-fn

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
- `match({ Just, Nothing })`

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
- `fold(leftFn, rightFn): T`

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
