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

[API documentation can be found here](/docs/index.md)

## 🧠 Examples

### Safe object access

```ts
import { fromNullable } from 'holo-fn/maybe'
import { pipe } from 'rambda'

const getUserName = (user: any) =>
  pipe(
    fromNullable(user.profile),
    m => m.chain(p => fromNullable(p.name)),
    m => m.unwrapOr('Guest')
  )(user)
```

### Optional parsing

```ts
import { fromNullable } from 'holo-fn/maybe'

const parsePrice = (input: string) =>
  fromNullable(parseFloat(input))
    .map(n => (n > 0 ? n : null))
    .chain(fromNullable)
    .unwrapOr(0)
```

---

## 🤝 Contributing

Please refer to [CONTRIBUTING.md](CONTRIBUTING.md) for instructions on how to run tests, build the library, and contribute.

## 📜 License

[Here license MIT](LICENSE)
