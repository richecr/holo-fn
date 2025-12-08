# inspect

Logs a value with an optional label and returns it unchanged. A specialized version of [`tap`](./tap.md) for debugging that automatically logs to `console.log`.

## Signature

```typescript
function inspect<T>(label?: string): (value: T) => T
```

## Parameters

- `label` (optional): A string label to prefix the logged value

## Returns

A function that:
- Takes a value of any type
- Logs it to console (with label if provided)
- Returns the value unchanged

## Usage

### Basic Usage with Label

```typescript
import { pipe } from 'rambda';
import { just, map } from 'holo-fn/maybe';
import { inspect } from 'holo-fn';

pipe(
  just(42),
  map(x => x * 2),
  inspect('After doubling'),  // Logs: "After doubling: Just(84)"
  map(x => x + 10)
);
```

### Without Label

```typescript
import { ok } from 'holo-fn/result';
import { inspect } from 'holo-fn';

pipe(
  ok({ id: 1, name: 'Alice' }),
  inspect(),  // Logs: Ok({ id: 1, name: 'Alice' })
  map(user => user.name)
);
```

### Debugging Pipelines

```typescript
import { pipe } from 'rambda';
import { just, map } from 'holo-fn/maybe';
import { inspect } from 'holo-fn';

const result = pipe(
  just(10),
  inspect('Initial value'),      // Logs: "Initial value: Just(10)"
  map(x => x * 2),
  inspect('After doubling'),      // Logs: "After doubling: Just(20)"
  map(x => x + 5),
  inspect('Final result')         // Logs: "Final result: Just(25)"
);
```

### With Arrays

```typescript
import { pipe } from 'rambda';
import { inspect } from 'holo-fn';

pipe(
  [1, 2, 3, 4],
  inspect('Initial array'),       // Logs: "Initial array: [1, 2, 3, 4]"
  arr => arr.filter(x => x > 2),
  inspect('After filter'),        // Logs: "After filter: [3, 4]"
  arr => arr.map(x => x * 2),
  inspect('Final result')         // Logs: "Final result: [6, 8]"
);
```

### With Plain Objects

```typescript
import { pipe } from 'rambda';
import { inspect } from 'holo-fn';

const user = pipe(
  { id: 1, name: 'Alice', age: 30 },
  inspect('User data'),           // Logs: "User data: { id: 1, name: 'Alice', age: 30 }"
  user => ({ ...user, age: user.age + 1 }),
  inspect('After birthday')       // Logs: "After birthday: { id: 1, name: 'Alice', age: 31 }"
);
```

## Common Use Cases

### Debugging Complex Transformations

```typescript
import { pipe } from 'rambda';
import { fromNullable, map, chain } from 'holo-fn/maybe';
import { inspect } from 'holo-fn';

const getUserEmail = (userId: number) =>
  pipe(
    fetchUser(userId),
    fromNullable,
    inspect('User fetched'),
    map(user => user.profile),
    inspect('Profile extracted'),
    chain(profile => fromNullable(profile.email)),
    inspect('Email result')
  );
```

### Finding Where Transformations Fail

```typescript
import { pipe } from 'rambda';
import { fromThrowable } from 'holo-fn/result';
import { inspect } from 'holo-fn';

const parseAndValidate = (input: string) =>
  pipe(
    input,
    inspect('Raw input'),
    fromThrowable(JSON.parse),
    inspect('After parsing'),      // See if parsing succeeded
    map(validateSchema),
    inspect('After validation')    // See validation result
  );
```

### Monitoring Data Flow

```typescript
import { pipe } from 'rambda';
import { all } from 'holo-fn/maybe';
import { inspect } from 'holo-fn';

const results = pipe(
  [
    fetchData(1),
    fetchData(2),
    fetchData(3)
  ],
  inspect('Individual results'),
  all,
  inspect('Combined result'),
  map(data => processData(data)),
  inspect('Processed data')
);
```

## Differences from `tap`

While [`tap`](./tap.md) is a generic utility for any side-effect, `inspect` is specialized for logging:

```typescript
// tap - generic, you provide the logging logic
tap(x => console.log('Value:', x))

// inspect - specialized for logging, with optional label
inspect('Value')
```

Both are useful:
- Use `tap` when you need custom side-effects (metrics, validation, etc.)
- Use `inspect` for quick debugging with console.log

## Key Features

- ✅ **Non-intrusive**: Doesn't modify the value or pipeline flow
- ✅ **Type-safe**: Preserves type information through the pipeline
- ✅ **Flexible**: Works with any type (monads, primitives, objects, arrays)
- ✅ **Convenient**: Automatic `console.log` with optional labeling
- ✅ **Composable**: Easy to add/remove in pipelines during debugging

## Tips

1. **Add labels for clarity** in complex pipelines
2. **Remove or comment out** `inspect` calls before production
3. **Combine with `tap`** for custom logging behavior
4. **Use descriptive labels** to track transformation stages
5. **Remember it always uses `console.log`** - use `tap` for custom logging

## Type Safety

`inspect` is fully type-safe and preserves types:

```typescript
const value: Maybe<number> = pipe(
  just(42),
  inspect('Number'),  // Type: Maybe<number>
  map(x => x * 2)     // x is correctly inferred as number
);
```

## Related

- [`tap`](./tap.md) - Generic side-effect utility
- [Maybe](../maybe/index.md)
- [Result](../result/index.md)
- [Either](../either/index.md)
