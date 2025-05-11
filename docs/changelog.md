# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [[0.3.0]](https://github.com/richecr/holo-fn/releases/tag/v0.3.0) - 2025-05-10

### Added
- New helpers functions:
  - Maybe:
    - just(value: T): Maybe<T>: Creates a `Just` value representing the presence of a value.
    - nothing<T = never>(): Maybe<T>: Creates a `Nothing` value representing the absence of a value.
  - Either:
    - left<L, R = never>(value: L): Either<L, R>: Creates a `Left` value representing a failure or error.
    - right<L, R>(value: R): Either<L, R>: Creates a `Right` value representing a success.
  - Result:
    - ok<T, E>(value: T): Result<T, E>: Creates an `Ok` value representing the success of an operation with a value.
    - err<T, E>(error: E): Result<T, E>: Creates an `Err` value representing a failure of an operation with an error.
  
---

## [[0.2.0]](https://github.com/richecr/holo-fn/releases/tag/v0.2.0) - 2025-04-26

### Added
- Introduced the `equals` method for **Maybe**, **Either**, and **Result** types to compare instances of these types based on their internal values.
- Added **curried functions** for `equals` to allow for easier composition and usage:
  - `equalsM` for **Maybe**.
  - `equalsE` for **Either**.
  - `equalsR` for **Result**.
- New helper functions for easy comparison between monadic values.

### Changed
- Refined the API for better type inference and consistency across all functional types (`Maybe`, `Either`, `Result`).
- Improved **type safety** for curried functions in all monads.
  
---

## [[0.1.0]](https://github.com/richecr/holo-fn/releases/tag/v0.1.0) - 2025-04-23

### Added
- Initial release of **holo-fn** with core monads: `Maybe`, `Either`, and `Result`.
- `Maybe` monad: `Just`, `Nothing`, and helper functions like `fromNullable`.
- `Either` monad: `Left`, `Right`, `tryCatch`, `fromPromise`, `fromAsync`.
- `Result` monad: `Ok`, `Err`, `fromThrowable`, `fromPromise`, `fromAsync`.
- Added **curried handlers** for `map`, `chain`, `unwrapOr`, and `match` for better composition and functional pipelines:
  - `mapE`, `chainE`, `unwrapOrE`, and `matchE` for `Either`.
  - `mapM`, `chainM`, `unwrapOrM`, and `matchM` for `Maybe`.
  - `mapR`, `chainR`, `unwrapOrR`, and `matchR` for `Result`.
  
---
