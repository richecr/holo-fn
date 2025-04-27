# 🚀 Getting Started

## Installation

To install **holo-fn** in your project, use the following npm command:

```bash
npm install holo-fn
```

## Importing

You can import specific monads or helpers as needed:

```ts
import { Just, Nothing, matchE } from 'holo-fn'
import { fromNullable } from 'holo-fn/maybe'
import { tryCatch } from 'holo-fn/either'
import { fromThrowable } from 'holo-fn/result'
```

---

## 📦 API Reference

- [Maybe](./maybe/index.md)
- [Either](./either/index.md)
- [Result](./result/index.md)

### 📚 Comparison between Maybe, Either, and Result

| **Aspect**               | **Maybe**                               | **Either**                           | **Result**                            |
|---------------------------|-----------------------------------------|--------------------------------------|---------------------------------------|
| **Purpose**               | Represents a value that may be `null` or `undefined`. | Represents an operation that can either succeed (`Right`) or fail (`Left`). | Represents the result of an operation, which can either succeed (`Ok`) or fail with an error (`Err`). |
| **Types**                 | `Just<T>`, `Nothing`                    | `Right<R>`, `Left<L>`                | `Ok<T>`, `Err<E>`                     |
| **Composition (map, chain)** | Supports `map`, `chain` for simple compositions. | Supports `map`, `chain` for compositions involving success or failure. | Supports `map`, `chain` for manipulating values or errors. |
| **Method to Access Value** | `getOrElse(defaultValue)`               | `getOrElse(defaultValue)`            | `unwrapOr(defaultValue)`              |
| **Method for Success Case** | `isJust()`, `isNothing()`               | `isRight()`, `isLeft()`              | `isOk()`, `isErr()`                   |
| **Usage Example**         | `fromNullable(value)`                  | `new Right(value)` or `new Left(error)` | `new Ok(value)` or `new Err(error)`   |
| **When to Use**            | When there is an optional value that may be `null` or `undefined`. | When an operation can succeed or fail, and it is important to distinguish between them. | When you need to clearly distinguish between success or failure in an operation. |
| **Common Helpers**         | `fromNullable`                         | `tryCatch`, `fromPromise`            | `fromThrowable`, `fromPromise`, `fromAsync` |
| **Example of `map`**       | `maybeValue.map(value => value * 2)`   | `eitherValue.map(value => value * 2)` | `resultValue.map(value => value * 2)`  |
| **Example of `chain`**     | `maybeValue.chain(value => fromNullable(value))` | `eitherValue.chain(value => new Right(value))` | `resultValue.chain(value => new Ok(value))` |

## Changelog

All notable changes to this project will be documented in [here](./changelog.md).

## 🤝 Contributing

We welcome contributions to **holo-fn**! Please refer to the [CONTRIBUTING.md](./contributing.md) for detailed instructions on how to run tests, build the library, and contribute.

---

## 📜 License

MIT
