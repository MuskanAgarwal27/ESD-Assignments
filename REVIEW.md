# REVIEW.md — AI Output Review Log

Complete **one review entry per slice** before moving to the next.  


---

## Slice 1 — Signup (S1)

### A. Bucket Check
List every class and method the AI produced. Tag each one:
`Controller` / `Service` / `Repository` / `DTO` / `Security` / `Config` / `Exception`

| File / Method | Tag | In Allowed List? |
|---|---|---|
| `AuthController.signup()` | Controller | Verify against assignment allowed list |
| `AuthService.signup()` | Service | Verify against assignment allowed list |
| `SignupRequest` | DTO | Verify against assignment allowed list |
| `UserResponse` | DTO | Verify against assignment allowed list |

> Verify each file against the assignment's allowed list before final acceptance.

### B. Contract Check

| Check | Pass / Fail |
|---|---|
| Path is `POST /api/auth/signup` | Pass — tested |
| Returns **201** | Pass — new signup returned HTTP 201 |
| Response shape: `{ id, email, fullName, role, createdAt }` | Pending — inspect a complete successful response |
| No `passwordHash` field in response | Pass — absent from the successful response shown |
| Role in response is always `STUDENT` | Pass — service explicitly sets `Role.STUDENT`; successful response began with this role |

### C. Validation & Errors

| Check | Pass / Fail |
|---|---|
| `@Valid` on controller parameter | Pass — verified in `AuthController` |
| `@Email`, `@NotBlank`, `@Size` on DTO fields | Pass — verified in `SignupRequest` |
| Duplicate email throws `DuplicateResourceException` | Pass — verified in `AuthService`; duplicate request returned HTTP 409 |
| No new error/response wrapper class invented | Pending — verify exception classes and Git diff |
| No stack trace or exception message leaked to client | Pass for tested validation and duplicate cases — clean JSON errors returned; handler still needs review |

### D. Security Specifics

| Check | Pass / Fail |
|---|---|
| Password hashed via injected `PasswordEncoder` (not `new BCryptPasswordEncoder()`) | Pass — verified in `AuthService` |
| `SignupRequest` has no `role` field, or it is ignored | Pass — verified in the DTO; service assigns `Role.STUDENT` |
| Duplicate check uses normalised (lowercased/trimmed) email | Pass — verified in `AuthService` |
| AI did **not** touch `SecurityConfig`, add JWT class, or add `UserDetailsService` | Pending — `SecurityConfig` diff was empty; verify Git status/diff and JWT-related files |

### E. Understanding Questions
*Answer in your own words (1–2 lines each). These are draft answers to review and rewrite in your own words.*

1. Where exactly is the password hashed, and why is the same password stored as a different string for two users?

   > Your answer: In `AuthService.signup()`, the injected `PasswordEncoder` hashes the password before saving the user. Secure password hashing uses a salt, so the same password can produce different stored hashes.

2. What would happen if `SignupRequest` accepted a `role` field and the AI used it?

   > Your answer: A user could try to register as an ADMIN. The server must assign the role itself and must not trust a role provided by the client.

3. Which class turns `DuplicateResourceException` into a 409 response?

   > Your answer: The global exception handler maps `DuplicateResourceException` to HTTP 409. Verify the exact class and method in `GlobalExceptionHandler`.

### F. Decision

| File | Decision | Reason (if modified/rejected) |
|---|---|---|
| `AuthController.java` | Provisionally accepted | Correct signup endpoint, `@Valid`, and HTTP 201; complete response contract still to be confirmed |
| `SignupRequest.java` | Provisionally accepted | Required email, password, and full-name validation are present |
| `AuthService.java` | Provisionally accepted | Normalises email, checks duplicates, hashes the password, and assigns `STUDENT` |
| `UserResponse.java` | Provisionally accepted | Earlier code shows the intended fields and excludes password hash; verify complete response |
| `SecurityConfig.java` | No change observed | Previously checked diff was empty; verify again before final acceptance |

**Manual test results recorded:**
- New email `student2@example.com`: HTTP 201.
- Existing email `student1@example.com`: HTTP 409, `Email already exists`.
- Password shorter than 8 characters: HTTP 400 with a password-size validation error.

**Still to verify before closing S1:** complete response including `createdAt`, exact allowed-list compliance, exception-handler mapping, and final Git diff.
---

## Slice 2 — Login & JWT (S2)

### A. Bucket Check

| File / Method | Tag | In Allowed List? |
|---|---|---|
| | | |

### B. Contract Check

| Check | Pass / Fail |
|---|---|
| Path is `POST /api/auth/login` | |
| Returns **200** | |
| Response: `{ accessToken, tokenType: "Bearer", expiresIn }` | |
| `expiresIn` matches configured value (not hardcoded) | |

### C. Validation & Errors

| Check | Pass / Fail |
|---|---|
| Same 401 message for unknown email and wrong password | |
| No `try/catch` swallowing exceptions silently | |

### D. Security Specifics

| Check | Pass / Fail |
|---|---|
| JWT secret comes from `@Value`, no string literal secret | |
| Uses jjwt 0.12 API: `.subject()`, `.claim()`, `.id()`, `.issuedAt()`, `.expiration()`, `.signWith(key)` | |
| Rejects deprecated: `setSubject`, `setExpiration`, `signWith(SignatureAlgorithm.HS256, secret)`, `Jwts.parserBuilder()` | |
| `jti` is a random UUID (not the user id) | |
| No password or hash in token claims | |
| Parse/validate method **not** written yet (that is S3) | |

### E. Understanding Questions

1. Why must the error message be identical for "no such email" and "wrong password"?

   > *Your answer:*

2. Who can read the claims inside your JWT? Who can change them?

   > *Your answer:*

3. What does `jti` give us that `sub` doesn't? (Think about S5.)

   > *Your answer:*

### F. Decision

| File | Decision | Reason |
|---|---|---|
| | | |

---

## Slice 3 — JWT Filter & Protected API (S3)

### A. Bucket Check

| File / Method | Tag | In Allowed List? |
|---|---|---|
| | | |

### B. Contract Check

| Check | Pass / Fail |
|---|---|
| `GET /api/courses` works **without** token | |
| `GET /api/users/me` returns **401** with no token | |
| `GET /api/users/me` returns **200** with valid token | |
| 401 body is an `ApiError` JSON object | |

### C. Validation & Errors

| Check | Pass / Fail |
|---|---|
| Filter does not write a response on error — continues chain | |
| Filter clears SecurityContext on bad token | |

### D. Security Specifics

| Check | Pass / Fail |
|---|---|
| Spring Security 6 style: lambda DSL, `requestMatchers`, `authorizeHttpRequests` | |
| Rejected: `WebSecurityConfigurerAdapter`, `antMatchers`, `authorizeRequests`, `.and()` | |
| `permitAll` covers only the three specific public endpoints | |
| `GET /api/courses` is public but `POST /api/courses` is NOT (watch for broad matcher) | |
| Signature + expiry verified with `Jwts.parser().verifyWith(key).build().parseSignedClaims(token)` | |
| Authorities use `ROLE_` prefix | |
| Entry point and access-denied handler wired via `exceptionHandling(...)` | |
| No `UserDetailsService`, `AuthenticationManager`, sessions or CORS added | |
| `GET /api/users/me` returns `UserResponse`, not the entity | |

### E. Understanding Questions

1. Why is CSRF protection disabled here, and when would disabling it be wrong?

   > *Your answer:*

2. Walk through what happens to a request with an expired token, step by step, until the client sees 401.

   > *Your answer:*

3. Why don't 401/403 errors from the filter chain reach `GlobalExceptionHandler`?

   > *Your answer:*

### F. Decision

| File | Decision | Reason |
|---|---|---|
| | | |

---

## Slice 4 — Role Restriction (S4)

### A. Bucket Check

| File / Method | Tag | In Allowed List? |
|---|---|---|
| | | |

### B. Contract Check

| Check | Pass / Fail |
|---|---|
| `POST /api/courses` with no token → **401** | |
| `POST /api/courses` with STUDENT token → **403** | |
| `POST /api/courses` with ADMIN token → **201** | |
| 403 body is an `ApiError` JSON object | |

### D. Security Specifics

| Check | Pass / Fail |
|---|---|
| Role naming consistent: `hasRole("ADMIN")` ↔ authority `ROLE_ADMIN` | |
| If `@PreAuthorize` used: `@EnableMethodSecurity` is present | |
| Rule placed **before** `anyRequest().authenticated()` if in SecurityConfig | |
| Diff is small — AI did not rewrite the whole config | |

### E. Understanding Questions

1. A STUDENT calls `POST /api/courses`. Why does the server return 403 and not 401?

   > *Your answer:*

2. Where does the role in the JWT come from, and can the client change it?

   > *Your answer:*

### F. Decision

| File | Decision | Reason |
|---|---|---|
| | | |

---

## Slice 5 — Logout (S5) *(stretch)*

### A. Bucket Check

| File / Method | Tag | In Allowed List? |
|---|---|---|
| | | |

### B. Contract Check

| Check | Pass / Fail |
|---|---|
| `POST /api/auth/logout` returns **204** | |
| Same token returns **401** after logout | |
| Fresh login after logout returns a new working token | |

### D. Security Specifics

| Check | Pass / Fail |
|---|---|
| Logout adds entry to server-side denylist (not just tells client to delete token) | |
| Denylist keyed by **jti**, not email | |
| Map is `ConcurrentHashMap` (thread-safe) | |
| Logout endpoint is NOT under `permitAll` | |
| Filter checks the denylist and treats denylisted jti as invalid | |
| (Bonus) Expired entries are removed from the map | |

### E. Understanding Questions

1. Why does logout need server-side state if JWT is "stateless"?

   > *Your answer:*

2. What happens to the denylist when the server restarts? What if there are two server instances?

   > *Your answer:*

3. Why store the expiry time with each jti?

   > *Your answer:*

### F. Decision

| File | Decision | Reason |
|---|---|---|
| | | |

---

## No-AI Change Tasks



**Files changed:**

| File | What changed and why |
|---|---|
| | |

**Explanation (your own words):**
> *Describe what you changed and why it works.*
