
# 📚 holo-fn Documentation

**A minimal functional library for TypeScript** featuring **monads** like `Maybe`, `Either` and `Result`. Built for composability and Rambda compatibility.

> 💡 Designed to work seamlessly with `pipe` from Rambda. Fully typed, immutable, and safe by default.

Below you will find detailed explanations, examples, and usage instructions to help you get started with **holo-fn**.

---

## ✨ Table of Contents

- [Introduction](#-introduction)
- [Features](#-features)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
  - [Maybe](/maybe)
  - [Either](/either)
  - [Result](/result)
- [Contributing](#-contributing)

---

## 💡 Introduction

**holo-fn** is a minimal functional library designed for TypeScript with full support for monads and functional programming principles. It includes commonly used monads like `Maybe`, `Either`, and `Result` for safe and composable functional programming.

- Designed to work seamlessly with `pipe` from `Rambda`.
- Fully typed, immutable by default, and safe for modern TypeScript development.

---

## ✨ Features

- ✅ Functional types: `Maybe`, `Either`, `Result`
- ⚙️ Pipe-friendly (Rambda/Ramda compatible)
- 🔒 Immutable by default
- 🧪 100% test coverage
- ⚡️ Zero dependencies
- 🧠 Full TypeScript inference

---

## 🚀 Getting Started

### Installation

To install **holo-fn** in your project, use the following npm command:

```bash
npm install holo-fn
```

### Importing

You can import specific monads or helpers as needed:

```ts
import { fromNullable } from 'holo-fn/maybe'
import { tryCatch } from 'holo-fn/either'
import { fromThrowable } from 'holo-fn/result'
```

---

## 📦 API Reference

- [Maybe](/docs/maybe/index.md)
- [Either](/docs/either/index.md)
- [Result](/docs/result/index.md)

### 📚 Comparison between Maybe, Either, and Result

| **Aspecto**               | **Maybe**                               | **Either**                           | **Result**                            |
|---------------------------|-----------------------------------------|--------------------------------------|---------------------------------------|
| **Propósito**              | Representa um valor que pode ser nulo ou indefinido. | Representa uma operação que pode ter sucesso (`Right`) ou falha (`Left`). | Representa um resultado de uma operação, podendo ser bem-sucedido (`Ok`) ou falhar com erro (`Err`). |
| **Tipos**                  | `Just<T>`, `Nothing`                    | `Right<R>`, `Left<L>`                | `Ok<T>`, `Err<E>`                     |
| **Composição (map, chain)**| Suporta `map`, `chain` para composições simples. | Suporta `map`, `chain` para composições com sucesso ou falha. | Suporta `map`, `chain` para manipulação de valores ou erros. |
| **Método de Acesso ao Valor** | `getOrElse(defaultValue)`               | `getOrElse(defaultValue)`            | `unwrapOr(defaultValue)`              |
| **Método para Caso de Sucesso** | `isJust()`, `isNothing()`               | `isRight()`, `isLeft()`              | `isOk()`, `isErr()`                   |
| **Exemplo de Uso**         | `fromNullable(value)`                  | `new Right(value)` or `new Left(error)` | `new Ok(value)` or `new Err(error)`   |
| **Quando Usar**            | Quando há um valor opcional que pode ser nulo ou indefinido. | Quando uma operação pode ter um erro ou sucesso, e é importante distinguir entre eles. | Quando se deseja distinguir claramente entre sucesso ou erro de uma operação. |
| **Helpers Comuns**         | `fromNullable`                         | `tryCatch`, `fromPromise`            | `fromThrowable`, `fromPromise`, `fromAsync` |
| **Exemplo de `map`**       | `maybeValue.map(value => value * 2)`   | `eitherValue.map(value => value * 2)` | `resultValue.map(value => value * 2)`  |
| **Exemplo de `chain`**     | `maybeValue.chain(value => fromNullable(value))` | `eitherValue.chain(value => new Right(value))` | `resultValue.chain(value => new Ok(value))` |

## 🤝 Contributing

We welcome contributions to **holo-fn**! Please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) for detailed instructions on how to run tests, build the library, and contribute.

---

## 📜 License

MIT
