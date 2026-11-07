# `Result<T, E>` — errors as values

`src/shared/result.ts` is the error-handling primitive used across the codebase.
It replaces `throw`/`try-catch` for **expected** failures (validation, not-found,
conflict) with a value the caller must inspect.

---

## 1. Why

- An expected failure is part of the domain ("quantity must be positive",
  "variant is not in this store"), not an exceptional event.
- `throw` hides the failure from the function's type signature; a caller can
  forget to handle it and only find out at runtime.
- `Result` puts the failure in the **return type**, so TypeScript forces the
  caller to branch on it.
- Unexpected failures (database down, a bug) still `throw` and are caught by the
  global error handler. `Result` is only for expected outcomes.

---

## 2. The type

```ts
export type Result<T, E> = { kind: 'ok'; value: T } | { kind: 'err'; error: E }
```

| Generic | Meaning                           |
| ------- | --------------------------------- |
| `T`     | the type of the **success value** |
| `E`     | the type of the **error**         |

`Result<number, string>` is either `{ kind: 'ok', value: number }` or
`{ kind: 'err', error: string }`.

It is a **tagged (discriminated) union**: `kind` tells you which shape you have.
It is a **type, not a class** — there are no methods on it. `map`, `flatMap`, and
`mapError` are standalone functions (the functional style), not
`result.map(...)`.

---

## 3. Constructing a `Result`

```ts
export const ok = <T, E>(value: T): Result<T, E> => ({ kind: 'ok', value })
export const err = <T, E>(error: E): Result<T, E> => ({ kind: 'err', error })
```

```ts
type DomainError = { code: string; message: string }

function parseAge(input: string): Result<number, DomainError> {
  const n = Number(input)
  if (Number.isNaN(n))
    return err({ code: 'INVALID_INPUT', message: 'not a number' })
  return ok(n)
}
```

### Generic inference

`ok`/`err` declare both `T` and `E`, but each call only supplies one:

```ts
async function createThing(): Promise<Result<Product, DomainError>> {
  return ok(product) // E comes from the declared return type
}

const standalone = ok(5) // Result<number, unknown> — no context to infer E
```

In real code, `E` is almost always pinned by the enclosing function's return
type, so you rarely write `ok<T, E>` explicitly.

---

## 4. Reading a `Result`

```ts
const r = parseAge('42')

if (r.kind === 'ok') {
  r.value // number
} else {
  r.error // DomainError
}
```

`r.kind === 'ok'` is a **type guard**: inside the branch TypeScript narrows `r`
to the `ok` variant, so `r.value` exists; in the `else` it narrows to the `err`
variant, so `r.error` exists.

Propagating a failure is a one-liner:

```ts
const productResult = createProduct(draft)
if (productResult.kind === 'err') return productResult
// ... productResult.value is now a valid Product
```

Because the union is closed (`kind` is only `'ok' | 'err'`), the compiler knows
you have handled both cases.

---

## 5. Combinators

### `map` — transform the success, leave the error alone

```ts
map(r, (age) => age * 2) // Result<number, DomainError>
```

- `ok` → `ok(f(value))`
- `err` → unchanged (same error)

Use it when the transformation **cannot fail**.

### `flatMap` — chain a step that itself can fail

```ts
flatMap(r, (age) =>
  age >= 18 ? ok('adult') : err(domainError('INVALID_INPUT', 'minor')),
)
// Result<string, DomainError>
```

With `map` you would get `Result<Result<string, E>, E>` (nested). `flatMap`
flattens it — the FP analogue of `Promise.then`, but for fallible steps.

### `mapError` — change only the error type

```ts
mapError(r, (e) => new BadRequestError(e.message)) // Result<number, BadRequestError>
```

This is the idea behind `src/shared/to-http-error.ts`: at the HTTP boundary, a
`DomainError` becomes an HTTP error.

> `map` / `flatMap` / `mapError` are available for composition, but most of the
> codebase simply branches on `kind`. That is fine and often clearer.

---

## 6. How the codebase uses it

```
domain smart constructor
  → Result<Product, DomainError>        validate invariants
application use case
  → if (kind === 'err') return result   propagate domain failure
  → ok(await repository.create(...))    wrap the persisted value
http handler
  → if (kind === 'err') throw toHttpError(result.error)
  → req.dbResult = result.value
```

Concretely, from `src/context/orders/application/create-order.ts`:

```ts
const orderResult = createOrder(draft, priceOf, stockOf)
if (orderResult.kind === 'err') return orderResult

const persisted = await repository.create({ order: orderResult.value })
return ok(persisted)
```

and from `src/context/orders/http/create-order.ts`:

```ts
if (result.kind === 'err') throw toHttpError(result.error)
req.dbResult = result.value
```

`toHttpError` (`src/shared/to-http-error.ts`) maps a `DomainError` code to the
matching HTTP error class:

| `DomainError.code` | HTTP |
| ------------------ | ---- |
| `INVALID_INPUT`    | 400  |
| `UNAUTHENTICATED`  | 401  |
| `UNAUTHORIZED`     | 403  |
| `NOT_FOUND`        | 404  |
| `CONFLICT`         | 409  |
| `INTERNAL`         | 500  |

---

## 7. `Result` vs exceptions

| Use `Result` for                    | Use `throw` for                                     |
| ----------------------------------- | --------------------------------------------------- |
| validation failures                 | database/network outages                            |
| business-rule violations            | programming errors (a bug)                          |
| "not found" / "conflict"            | anything you did not expect                         |
| anything the caller **must** handle | anything the global error handler should log as 500 |

Never `throw` for a validation or business rule; never `Result`-wrap an
unexpected infrastructure failure.

---

## 8. Pitfalls

- **`E` is `unknown` without context.** `const x = ok(5)` produces
  `Result<number, unknown>`. Declare the function's return type (or use
  `ok<number, DomainError>(5)`).
- **Don't wrap every read.** Reads can be `Promise<T | null>`; `Result` is for
  operations that can fail on a domain rule.
- **Don't nest.** Use `flatMap`, not `map`, when the next step returns a
  `Result`.
- **Keep `DomainError` HTTP-free.** Map to HTTP only at the boundary
  (`toHttpError`).
- **Don't silently swallow.** Branching on `kind` and ignoring `err` defeats the
  point; propagate it or map it deliberately.

---

## 9. Cheat sheet

```ts
ok(value) // Result<T, E>  success
err(error) // Result<T, E>  failure

if (r.kind === 'ok') r.value // narrowed success
if (r.kind === 'err') r.error // narrowed failure

map(r, f) // transform success; error untouched
flatMap(r, f) // chain a fallible step
mapError(r, f) // transform error; success untouched
```
