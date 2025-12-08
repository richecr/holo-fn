# tap

A utility function for executing side-effects in functional pipelines without altering the data flow.

## Overview

`tap` allows you to perform side-effects (like logging, debugging, or metrics) in the middle of a pipeline while keeping the data unchanged. It's a generic function that works with any value type - monads, arrays, objects, primitives, etc.

## Signature

```typescript
function tap<T>(fn: (value: T) => void): (value: T) => T
```

## Parameters

- `fn`: A function that receives the value and performs a side-effect (returns void)

## Returns

A function that:
1. Takes a value of type `T`
2. Executes the side-effect function with that value
3. Returns the original value unchanged

## Usage

### With Maybe

```typescript
import { just, map, tap } from "holo-fn";
import { pipe } from "rambda";

const result = pipe(
  just(42),
  tap(m => console.log("Maybe:", m.unwrapOr(0))),
  map(x => x * 2),
  tap(m => console.log("After map:", m.unwrapOr(0)))
);
// Logs: "Maybe: 42"
// Logs: "After map: 84"
// Returns: Just(84)
```

### With Result

```typescript
import { ok, map, tap } from "holo-fn";
import { pipe } from "rambda";

const result = pipe(
  ok(100),
  tap(r => console.log("Initial:", r.unwrapOr(0))),
  map(x => x / 2),
  tap(r => console.log("After division:", r.unwrapOr(0)))
);
// Logs: "Initial: 100"
// Logs: "After division: 50"
// Returns: Ok(50)
```

### With Either

```typescript
import { right, map, tap } from "holo-fn";
import { pipe } from "rambda";

const result = pipe(
  right(10),
  tap(e => console.log("Right value:", e.unwrapOr(0))),
  map(x => x + 5),
  tap(e => console.log("After adding:", e.unwrapOr(0)))
);
// Logs: "Right value: 10"
// Logs: "After adding: 15"
// Returns: Right(15)
```

### With Plain Values

```typescript
import { tap } from "holo-fn";
import { pipe } from "rambda";

const result = pipe(
  42,
  tap(x => console.log("Initial:", x)),
  x => x * 2,
  tap(x => console.log("Doubled:", x)),
  x => x + 10,
  tap(x => console.log("Final:", x))
);
// Logs: "Initial: 42"
// Logs: "Doubled: 84"
// Logs: "Final: 94"
// Returns: 94
```

### With Arrays

```typescript
import { tap } from "holo-fn";
import { pipe } from "rambda";

const result = pipe(
  [1, 2, 3],
  tap(arr => console.log("Length:", arr.length)),
  arr => arr.map(x => x * 2),
  tap(arr => console.log("After map:", arr)),
  arr => arr.filter(x => x > 2)
);
// Logs: "Length: 3"
// Logs: "After map: [2, 4, 6]"
// Returns: [4, 6]
```

### With Objects

```typescript
import { tap } from "holo-fn";
import { pipe } from "rambda";

const result = pipe(
  { name: "Alice", age: 25 },
  tap(obj => console.log("User:", obj.name)),
  obj => ({ ...obj, age: obj.age + 1 }),
  tap(obj => console.log("Age updated:", obj.age))
);
// Logs: "User: Alice"
// Logs: "Age updated: 26"
// Returns: { name: "Alice", age: 26 }
```

## Common Use Cases

### 1. Debugging

```typescript
const processData = pipe(
  fetchData(),
  tap(data => console.log("Raw data:", data)),
  parseData,
  tap(parsed => console.log("Parsed:", parsed)),
  validateData,
  tap(valid => console.log("Validated:", valid))
);
```

### 2. Logging

```typescript
const processUser = pipe(
  getUser(id),
  tap(user => logger.info("User fetched", { userId: user.id })),
  validateUser,
  tap(user => logger.info("User validated")),
  saveUser,
  tap(user => logger.info("User saved", { userId: user.id }))
);
```

### 3. Metrics and Monitoring

```typescript
const processOrder = pipe(
  createOrder(data),
  tap(order => metrics.recordOrderCreated(order.id)),
  validateOrder,
  tap(order => metrics.recordOrderValidated()),
  processPayment,
  tap(order => metrics.recordPaymentProcessed())
);
```

### 4. Side-effects with Conditions

```typescript
const processValue = pipe(
  getValue(),
  tap(v => {
    if (v > 100) {
      console.warn("High value detected:", v);
    }
  }),
  transform,
  tap(v => {
    if (debug.enabled) {
      console.log("Debug:", v);
    }
  })
);
```

### 5. Error Tracking

```typescript
const processData = pipe(
  fetchData(),
  tap(result => {
    if (result.isErr()) {
      sentry.captureException(result.extract());
    }
  }),
  map(processValue),
  tap(result => {
    if (result.isErr()) {
      logger.error("Processing failed", result.extract());
    }
  })
);
```

## Key Features

- **Generic**: Works with any type - monads, primitives, objects, arrays
- **Non-intrusive**: Doesn't modify the data flowing through the pipeline
- **Composable**: Can be used multiple times in a single pipeline
- **Type-safe**: TypeScript preserves types correctly
- **Flexible**: Suitable for logging, debugging, metrics, or any side-effect

## Tips

1. **Keep side-effects pure from data perspective**: `tap` should not modify the value, only observe or perform external actions
2. **Use for observability**: Great for adding logging/metrics without cluttering business logic
3. **Conditional logging**: Wrap debug logs in conditions to avoid performance impact in production
4. **Chain multiple taps**: Don't hesitate to use multiple `tap` calls for different concerns

## Type Safety

TypeScript correctly infers the type through `tap`:

```typescript
// Type is preserved
const result: Maybe<number> = pipe(
  just(42),
  tap(x => console.log(x)), // x: Maybe<number>
  map(x => x * 2)            // Type: Maybe<number>
);

// Works with union types
const value: string | number = pipe(
  getUnionValue(),
  tap(x => console.log(typeof x)), // x: string | number
  transform
);
```

## Related

- [`map`](./maybe/index.md#map) - Transform values
- [`chain`](./maybe/index.md#chain) - Chain computations
- [`match`](./maybe/index.md#match) - Pattern matching

## Notes

- Side-effects in `fn` should not throw errors (or handle them internally)
- The return value of `fn` is ignored
- `tap` is executed synchronously in the pipeline
