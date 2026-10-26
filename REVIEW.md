# REVIEW.md — AI Output Review Log

Complete **one review entry per slice** before moving to the next.

---

## Slice 1 — Signup (S1)

### A. Bucket Check

| File / Method | Tag | In Allowed List? |
|---|---|---|
| `AuthController.signup()` | Controller | Yes |
| `AuthService.signup()` | Service | Yes |
| `UserRepository` methods used for signup | Repository | Yes |
| `SignupRequest` | DTO | Yes |
| `SignupResponse` | DTO | Yes |
| `PasswordEncoder` usage | Security | Yes |
| `DuplicateResourceException` | Exception | Yes |
| `GlobalExceptionHandler` (existing class) | Exception | Verify existing allowed-list status |

**Important:** Anything not in the allowed list → reject and re-prompt. Don't keep it because it works.

### B. Contract Check

| Check | Pass / Fail |
|---|---|
| Path is `POST /api/auth/signup` | VERIFY |
| Returns **201** | VERIFY |
| Response shape: `{ id, email, fullName, role, createdAt }` | VERIFY |
| No `passwordHash` field in response | VERIFY |
| Role in response is always `STUDENT` | VERIFY |

### C. Validation & Errors

| Check | Pass / Fail |
|---|---|
| `@Valid` on controller parameter | VERIFY |
| `@Email`, `@NotBlank`, `@Size` on DTO fields | VERIFY |
| Duplicate email throws `DuplicateResourceException` | VERIFY |
| No new error/response wrapper class invented | VERIFY |
| No stack trace or exception message leaked to client | VERIFY |

### D. Security Specifics

| Check | Pass / Fail |
|---|---|
| Password hashed via injected `PasswordEncoder` (not `new BCryptPasswordEncoder()`) | VERIFY |
| `SignupRequest` has no `role` field, or it is ignored | VERIFY |
| Duplicate check uses normalised (lowercased/trimmed) email | VERIFY |
| AI did **not** touch `SecurityConfig`, add JWT class, or add `UserDetailsService` | VERIFY |

### E. Understanding Questions

*Answer in your own words (1–2 lines each).*

1. Where exactly is the password hashed, and why is the same password stored as a different string for two users?

   > **Your answer:** The password is hashed in `AuthService` using the injected `PasswordEncoder`. BCrypt uses a random salt, so the same password can produce different stored hashes.

2. What would happen if `SignupRequest` accepted a `role` field and the AI used it?

   > **Your answer:** A user could choose their own role, potentially registering as an ADMIN and gaining unauthorised privileges.

3. Which class turns `DuplicateResourceException` into a 409 response?

   > **Your answer:** The existing `GlobalExceptionHandler`, if it has a handler mapping `DuplicateResourceException` to HTTP 409.

### F. Decision

| File | Decision | Reason (if modified/rejected) |
|---|---|---|
| S1 implementation files | Accepted / Modified / Rejected — choose after verification | S1 was committed as `51afb11`; verify the contract and allowed-file list before finalising this review. |

---

## Slice 2 — Login & JWT (S2)

### A. Bucket Check

| File / Method | Tag | In Allowed List? |
|---|---|---|
| `AuthController.login()` | Controller | Yes |
| `AuthService.login()` | Service | Yes |
| `LoginRequest` | DTO | Yes |
| `LoginResponse` | DTO | Yes |
| `JwtService.generateToken(User)` | Security | Yes |

### B. Contract Check

| Check | Pass / Fail |
|---|---|
| Path is `POST /api/auth/login` | PASS |
| Returns **200** | PASS |
| Response: `{ accessToken, tokenType: "Bearer", expiresIn }` | PASS |
| `expiresIn` matches configured value (not hardcoded) | PASS |

### C. Validation & Errors

| Check | Pass / Fail |
|---|---|
| Same 401 message for unknown email and wrong password | PASS |
| No `try/catch` swallowing exceptions silently | PASS |

### D. Security Specifics

| Check | Pass / Fail |
|---|---|
| JWT secret comes from `@Value`, no string literal secret | PASS |
| Uses jjwt 0.12 API: `.subject()`, `.claim()`, `.id()`, `.issuedAt()`, `.expiration()`, `.signWith(key)` | PASS |
| Rejects deprecated: `setSubject`, `setExpiration`, `signWith(SignatureAlgorithm.HS256, secret)`, `Jwts.parserBuilder()` | PASS |
| `jti` is a random UUID (not the user id) | PASS |
| No password or hash in token claims | PASS |
| Parse/validate method **not** written yet (that is S3) | PASS |

### E. Understanding Questions

1. Why must the error message be identical for "no such email" and "wrong password"?

   > **Your answer:** If the messages differ, someone could discover which email addresses have accounts. Using the same message reduces account enumeration.

2. Who can read the claims inside your JWT? Who can change them?

   > **Your answer:** Anyone who obtains the token can decode and read its claims because a JWT is signed, not encrypted. A client cannot change the claims and produce a valid signature without the signing secret.

3. What does `jti` give us that `sub` doesn't? (Think about S5.)

   > **Your answer:** `sub` identifies the user, while `jti` identifies one specific token. This lets us revoke an individual token without revoking every token belonging to that user.

### F. Decision

| File | Decision | Reason |
|---|---|---|
| `AuthController.java` | Accepted | Login endpoint delegates to `AuthService.login()` and returns HTTP 200. |
| `AuthService.java` | Accepted | Normalises email, checks credentials, generates the token, and returns the configured expiry. |
| `LoginRequest.java` | Accepted | Validates email and requires a nonblank password. |
| `LoginResponse.java` | Accepted | Returns `accessToken`, `tokenType`, and `expiresIn`. |
| `JwtService.java` | Accepted | Generates a signed JWT using the configured Base64 secret, HS256-compatible key, email subject, role claim, UUID `jti`, issue time, and expiry. |

**Verification notes:** `mvn -q -DskipTests compile` passed. Manual API tests confirmed HTTP 200 for valid credentials and HTTP 401 with the same `"Invalid email or password"` message for an unknown email and an incorrect password. Automated tests were not run successfully.

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

   > **Your answer:**

2. Walk through what happens to a request with an expired token, step by step, until the client sees 401.

   > **Your answer:**

3. Why don't 401/403 errors from the filter chain reach `GlobalExceptionHandler`?

   > **Your answer:**

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

   > **Your answer:**

2. Where does the role in the JWT come from, and can the client change it?

   > **Your answer:**

### F. Decision

| File | Decision | Reason |
|---|---|---|
| | | |

---


## Slice 5 — Logout (S5) *(stretch)*

### A. Bucket Check

| File / Method | Tag | In Allowed List? |
|---|---|---|
| `AuthController.java` — logout endpoint | Modified | Yes, if listed in the S5 instructions |
| `JwtAuthenticationFilter.java` — denylist validation | Modified | Yes, if listed in the S5 instructions |
| `TokenDenylist.java` — in-memory denylist | Created | Yes, if listed in the S5 instructions |

### B. Contract Check

| Check | Pass / Fail |
|---|---|
| `POST /api/auth/logout` returns **204** | Pass — manually verified |
| Same token returns **401** after logout | Pass — manually verified |
| Fresh login after logout returns a new working token | Not yet verified |

### D. Security Specifics

| Check | Pass / Fail |
|---|---|
| Logout adds entry to server-side denylist | Pass — revoked token rejected after logout |
| Denylist keyed by `jti`, not email | Pass — implementation reviewed |
| Map is `ConcurrentHashMap` (thread-safe) | Pass — implementation reviewed |
| Logout endpoint is NOT under `permitAll` | Pass — security configuration reviewed |
| Filter checks the denylist | Pass — manual request returned 401 |
| (Bonus) Expired entries are removed from the map | Pass — `cleanExpired()` implemented |

### E. Understanding Questions

1. Why does logout need server-side state if JWT is "stateless"?

   > Write your explanation in your own words.

2. What happens to the denylist when the server restarts? What if there are two server instances?

   > Write your explanation in your own words.

3. Why store the expiry time with each jti?

   > Write your explanation in your own words.

### F. Decision

| File | Decision | Reason |
|---|---|---|
| `AuthController.java` | Modified | Added the logout endpoint |
| `JwtAuthenticationFilter.java` | Modified | Rejects revoked JWTs |
| `TokenDenylist.java` | Created | Stores revoked token IDs and their expiration times |

---

## No-AI Change Tasks

Complete this section independently after closing AI tools, as required by the lab.

**Files changed:**

| File | What changed and why |
|---|---|
| Fill in after completing the required changes | |

**Explanation (your own words):**

> Describe what you changed and why it works.
