# 134. Next.js 16 Proxy File Export Fix

## Status

Accepted

## Context

After upgrading to Next.js 16, the app showed a runtime error and GET / returned 404:

```
The Proxy file "/proxy" must export a function named `proxy` or a default function.
```

In Next.js 16, the former `middleware` convention was renamed to **proxy**. A file at `src/proxy.ts` (or `proxy.js`) is expected and **must** export a function named `proxy` or a default function. Our `src/proxy.ts` existed but was empty, so Next treated every request through the proxy and failed when the export was missing.

## Decision

Implement a minimal pass-through proxy in `src/proxy.ts`:

- Import `NextResponse` and `NextRequest` from `next/server`.
- Export a named function `proxy(request: NextRequest)` that returns `NextResponse.next()`.
- No matcher or custom logic for now; all requests continue to the app as before.

Future redirects, rewrites, or auth checks can be added in this file.

## Consequences

- Root route (/) and all pages load again; 404 and white screen from this error are resolved.
- Proxy runs on every request with no behavioral change (pass-through).
- Aligns with Next.js 16 file convention (proxy instead of middleware).

## References

- [Next.js 16 proxy file convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
- `src/proxy.ts`
