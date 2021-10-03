# Maintained-ID
Identity &amp; authentication for Maintained services

## Flow
---

1. User authenticates with GitHub using Maintained GitHub app (public scope only)
2. User is redirected to id.maintained.cc with OAuth code, state
3. Maintained-ID uses GitHub to translate this into a GitHub token
4. Maintained-ID uses token to retrieve user's GitHub UUID (username)
5. UUID is signed into a JWT which is returned to the user
6. JWT can now be used across any Maintained service to authenticate

## Deployment
---

### Dependencies
- Deno ≥ 1.14 (minimum for WebCrypto support)
### Secrets and Files
- `environment/environment.dev.ts`: [example format given](environment/environment.ts)
- `keys/private.key.ts`: `export const secret: UInt8Array` (HMAC secret)
### Test & Run
- `deno test`
- `deno run -A main.ts`