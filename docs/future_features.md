# Futuras Features para holo-fn

Este documento contém ideias de novas funcionalidades para a biblioteca holo-fn.

## 1. Validação e Parsing
```typescript
validate<T>(predicate: (value: T) => boolean): Maybe<T>
filter<T>(predicate: (value: T) => boolean): Maybe<T>
validateWith<T, E>(value: T, predicate: (v: T) => boolean, error: E): Either<E, T>
```
Útil para validações de dados de formulários, APIs, etc.

## 2. Combinadores/Agregadores
```typescript
all<T>(maybes: Maybe<T>[]): Maybe<T[]>
any<T>(maybes: Maybe<T>[]): Maybe<T>
sequence<T>(maybes: Maybe<T>[]): Maybe<T[]>
traverse<T, U>(fn: (x: T) => Maybe<U>, arr: T[]): Maybe<U[]>
partition<L, R>(eithers: Either<L, R>[]): { lefts: L[], rights: R[] }
```
Essencial para trabalhar com listas de operações que podem falhar.

## 3. Conversões entre tipos
```typescript
maybeToEither<L, R>(maybe: Maybe<R>, leftValue: L): Either<L, R>
maybeToResult<T, E>(maybe: Maybe<T>, error: E): Result<T, E>
eitherToResult<T, E>(either: Either<E, T>): Result<T, E>
resultToEither<T, E>(result: Result<T, E>): Either<E, T>
```
Facilita a interoperabilidade entre os três tipos de monads.

## 4. Utilitários Async Avançados
```typescript
retryWithBackoff<T, E>(fn: () => Promise<T>, options: { maxRetries: number, delayMs: number }): Promise<Result<T, E>>
withTimeout<T, E>(promise: Promise<T>, timeoutMs: number, error: E): Promise<Result<T, E>>
allSettled<T, E>(promises: Promise<T>[]): Promise<Result<T, E>[]>
```

## 5. Pattern Matching Estendido
```typescript
matchMany([maybe1, maybe2], { allJust: (v1, v2) => ..., someNothing: () => ... })
matchWith(value, [[predicate1, handler1], [predicate2, handler2], [() => true, defaultHandler]])
```

## 6. Debug/Logging Helpers
```typescript
tap<T>(fn: (value: T) => void): (maybe: Maybe<T>) => Maybe<T>
inspect<T>(label?: string): (maybe: Maybe<T>) => Maybe<T>
```
Para facilitar debugging em pipelines funcionais.

## 7. Utilitários para Objetos
```typescript
mapProps<T extends object, K extends keyof T>(obj: T, key: K, fn: (v: T[K]) => T[K]): Maybe<T>
getPath<T>(obj: unknown, path: string[]): Maybe<T>
```

## 8. Monoid/Semigroup Support
```typescript
combine<T>(maybe1: Maybe<T>, maybe2: Maybe<T>, combiner: (a: T, b: T) => T): Maybe<T>
concat<T>(maybes: Maybe<T>[]): Maybe<T>
```

## 9. Lazy Evaluation
```typescript
lazy<T>(thunk: () => Maybe<T>): LazyMaybe<T>
```

## 10. JSON Serialization
```typescript
toJSON<T>(maybe: Maybe<T>): { type: 'Just' | 'Nothing', value?: T }
fromJSON<T>(json: any): Maybe<T>
```

## Prioridades

1. **Combinadores (all/sequence)** - Muito comum trabalhar com listas de operações
2. **Conversões entre tipos** - Aumenta a flexibilidade da biblioteca
3. **Validação/Filter** - Caso de uso extremamente comum
