# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **Smart type inference for combinators**: `all`, `sequence`, and `partition` now return `T[]` for homogeneous arrays and preserve tuple types for mixed types.
    - Before: `all([ok(1), ok(2), ok(3)])` returned `Result<[number, number, number], ...>` (tuple)
    - After: `all([ok(1), ok(2), ok(3)])` returns `Result<number[], ...>` (array)
    - Heterogeneous arrays still preserve tuple types: `all([ok(42), ok("hi")])` → `Result<[number, string], ...>`
    - Applies to `all`, `sequence` (Result/Either), and `partition` (Result/Either)
    - Makes `unwrapOr([])` work naturally without type errors

### Changed
- **Improved `unwrapOr` flexibility**: Now accepts default values of different (but compatible) types.
    - Example: `all([ok(1), ok(2)]).unwrapOr([])` now works without type errors.
    - Before: Required exact tuple type like `[0, 0]`.
    - After: Accepts any compatible type like `[]` for arrays.

---

## [1.2.0](https://github.com/richecr/holo-fn/releases/tag/v1.2.0) - 2025-12-08

### Added
- **`tap` helper function**: Executes side-effects in functional pipelines without altering data flow.
    - Generic utility that works with any type (monads, primitives, objects, arrays).
    - Useful for debugging, logging, metrics, and error tracking.
    - Example:
    ```ts
    pipe(
      just(42),
      tap(x => console.log('Value:', x)),
      map(x => x * 2)
    );
    ```

- **`inspect` helper function**: Logs values with optional labels for debugging.
    - Specialized version of `tap` that automatically uses `console.log`.
    - Convenient for quick debugging with optional label prefixes.
    - Example:
    ```ts
    pipe(
      just(42),
      inspect('After init'),  // Logs: "After init: Just(42)"
      map(x => x * 2),
      inspect('Final result')
    );
    ```

- **`all` combinator for `Maybe`, `Result`, and `Either`**: Combines an array of monads into a single monad containing an array of values.
    - `Maybe`: Returns `Just` with all values if all are `Just`, or `Nothing` if any is `Nothing`.
    - `Result`/`Either`: Collects **all** errors if any fail.
    - **Heterogeneous tuple support**: Preserves different types in arrays using advanced TypeScript type inference.
    - Example:
    ```ts
    all([just(1), just(2), just(3)]).unwrapOr([]); // [1, 2, 3]
    all([ok(1), err('e1'), err('e2')]); // Err(['e1', 'e2'])
    all([just(42), just("hello"), just(true)]); // Just<[number, string, boolean]>
    ```

- **`sequence` combinator for `Result` and `Either`**: Combines an array of monads with fail-fast behavior.
    - Stops at the **first** error instead of collecting all errors.
    - Returns single error type instead of array.
    - **Heterogeneous tuple support**: Preserves different types in arrays.
    - Example:
    ```ts
    sequence([ok(1), err('e1'), err('e2')]); // Err('e1') - stops at first!
    ```

- **`partition` function for `Result` and `Either`**: Separates an array of monads into successes and failures.
    - Returns a plain object with two arrays (not a monad).
    - Always processes all items.
    - **Heterogeneous tuple support**: Preserves different types in returned arrays.
    - Example:
    ```ts
    partition([ok(1), err('e1'), ok(2), err('e2')]);
    // { oks: [1, 2], errs: ['e1', 'e2'] }
    ```

- **Common Patterns documentation**: Added comprehensive documentation section with practical recipes for:
    - Validation pipelines with multiple checks
    - Form validation with error collection
    - Concurrent operations handling
    - Async error handling patterns
    - Data transformation pipelines

---

## [[1.1.0]](https://github.com/richecr/holo-fn/releases/tag/v1.1.0) - 2025-11-30

### Added
- **`filter` method for `Maybe`**: Validates values with a predicate, converting `Just` to `Nothing` when the predicate fails.
    - Added `filter(predicate: (value: T) => boolean): Maybe<T>` method to `Maybe` interface.
    - Added curried `filter` function for use with `pipe`.
    - Example:
    ```ts
    just(25).filter(x => x >= 18).unwrapOr(0); // 25
    just(15).filter(x => x >= 18).unwrapOr(0); // 0
    ```

- **`validate` method for `Result` and `Either`**: Validates values with custom error messages.
    - Added `validate(predicate: (value: T) => boolean, error: E): Result<T, E>` to `Result`.
    - Added `validate(predicate: (value: R) => boolean, leftValue: L): Either<L, R>` to `Either`.
    - Added curried `validate` functions for use with `pipe`.
    - Example:
    ```ts
    ok(25).validate(x => x >= 18, 'Must be 18+').unwrapOr(0); // 25
    ok(15).validate(x => x >= 18, 'Must be 18+').isErr(); // true
    ```

---

## [[1.0.0]](https://github.com/richecr/holo-fn/releases/tag/v1.0.0) - 2025-06-25

### Added
- First stable release of `holo-fn` with core monads: `Maybe`, `Either`, and `Result`.
- `Maybe` monad:
    - `Just`, `Nothing`, and helper functions like `fromNullable`.
    - Added methods like `map`, `chain`, `unwrapOr`, `match`, and `equals`.
- `Either` monad:
    - `Left`, 'Right', and helper functions like `tryCatch`, `fromPromise`, `fromAsync`.
    - Added methods like `map`, `chain`, `unwrapOr`, `match`, and `equals`.
- `Result` monad:
    - `Ok`, `Err`, and helper functions like `fromThrowable`, `fromPromise`, `fromAsync`.
    - Added methods like `map`, `chain`, `unwrapOr`, `match`, and `equals`.
- Introduced `curried functions` for `map`, `chain`, `unwrapOr`, and `match` for each monad:
    - `map`, `chain`, `unwrapOr`, and `match` for `Either`, `Maybe` and `Result`.
- `Export restructuring`:
    - Now, monads are imported from their specific files, instead of a global import.
    - Example:
    ```ts
    import { M, E, R } from "holo-fn";
    import { fromNullable } from 'holo-fn/maybe';
    import { tryCatch } from 'holo-fn/either';
    import { fromThrowable } from 'holo-fn/result';
    ```

### Changed
- `Migration to Bun`: The library is now compatible with `Bun` runtime, offering better performance and faster execution.
- Reorganized the imports for better modularization and performance.
    - Now, to use specific monads and functions, you must import from their respective files.

### Fixed
- Fixed `bug` related to circular imports.
- Optimized the library for faster loading and reduced bundle size.

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
