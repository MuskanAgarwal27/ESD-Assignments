# PROMPTS.md — AI Prompt Log

Record every prompt you send to the AI **starting from Slice 2**.  
Slice 1 is done manually — no AI. See `README.md` for the prompt template structure.

> **Rules:**
> - One prompt (+ follow-ups) per slice
> - Use the structured template from the README — free-form prompts are not allowed
> - Do not back-fill this file after the lab

---

## Example — How a good S1 prompt looks (for reference only, S1 is done manually)

```
CONTEXT
Spring Boot 3.x, Spring Security 6, Java 17+, jjwt 0.12.x. No other libraries.
Package layout:
  com.esd.lab2
  ├── config/       SecurityConfig.java, AdminSeeder.java
  ├── controller/   CourseController.java
  ├── service/      CourseService.java
  ├── dto/          CourseRequest.java, CourseResponse.java
  ├── entity/       User.java, Role.java (enum), Course.java
  ├── repository/   UserRepository.java, CourseRepository.java
  ├── exception/    ApiError.java, GlobalExceptionHandler.java,
  │                 DuplicateResourceException.java, InvalidCredentialsException.java,
  │                 ResourceNotFoundException.java
  └── security/     JsonAuthenticationEntryPoint.java, JsonAccessDeniedHandler.java


TASK
Implement only POST /api/auth/signup.
Request: SignupRequest { email (valid email, required), password (required, 8–64 chars),
         fullName (required, not blank, max 100) }.
Response: 201 with UserResponse { id, email, fullName, role, createdAt }.
The new user's role is always STUDENT, even if the request contains a role field.
Store email trimmed and lowercased. Hash the password with the existing PasswordEncoder bean.
If the email already exists, throw DuplicateResourceException.

ALLOWED TO CREATE OR CHANGE
dto/SignupRequest.java, dto/UserResponse.java,
service/AuthService.java (signup method only),
controller/AuthController.java (signup endpoint only)

RULES
- Do not create or modify any file not listed above.
- Use the existing exceptions in com.esd.lab2.exception. Do not create new error classes.
- Use DTOs for request and response. Never return an entity from a controller.
- Use jakarta.validation annotations for input validation.
- Use only APIs that exist in Spring Security 6 and jjwt 0.12. No deprecated methods.
- If something is unclear, add a TODO comment instead of guessing.

OUTPUT
Each file in full, with its path. Then a list of anything you assumed.
```

---


## Slice 2 — Login & JWT (S2)

**Prompt :**

```text
CONTEXT
Spring Boot 3.x, Spring Security 6, Java 17+, jjwt 0.12.x. No other libraries.
Use the existing com.esd.lab2 package layout and components from Slice 1.

TASK
Implement POST /api/auth/login.
Request: LoginRequest { email, password }.
Validate required fields. Normalize email by trimming whitespace and converting it to lowercase.
Find the user by email and verify the password using the existing PasswordEncoder bean.
If credentials are invalid, throw InvalidCredentialsException.
Generate a JWT using the existing JWT service/configuration.
Return LoginResponse containing the token, token type, and expiry information.
Never return the password hash or the User entity.

ALLOWED TO CREATE OR CHANGE
Only the files required for the login endpoint, JWT generation, and login DTOs.
Do not modify unrelated files.

RULES
Use existing exceptions and components where possible.
Use APIs compatible with Spring Security 6 and jjwt 0.12.
Use DTOs for requests and responses.
Do not expose secrets or hardcode credentials.
If something is unclear, add a TODO comment instead of guessing.

OUTPUT
Each changed file in full, with its path. Then a list of anything assumed.
```

---

## Slice 3 — JWT Filter & Protected API (S3)

**Prompt:**

```text
CONTEXT
Spring Boot 3.x, Spring Security 6, Java 17+, jjwt 0.12.x.
Use the existing com.esd.lab2 package layout and JWT service from Slice 2.

TASK
Implement JWT request authentication using a security filter.
Read bearer tokens from the Authorization header, validate them, and establish the authenticated user in the Spring Security context.
Configure public access for signup and login while protecting the appropriate authenticated endpoints.
Ensure unauthenticated requests receive the application's JSON 401 response.
Keep the existing error-handling conventions.

ALLOWED TO CREATE OR CHANGE
Only the security filter, security configuration, and supporting JWT/authentication files required for this slice.

RULES
Use existing project components wherever possible.
Do not expose secrets or return entities from controllers.
Use APIs compatible with Spring Security 6 and jjwt 0.12.
Do not modify unrelated files.
If something is unclear, add a TODO comment instead of guessing.

OUTPUT
Each changed file in full, with its path. Then a list of anything assumed.
```

---

## Slice 4 — Role Restriction (S4)

**Prompt :**

```text
CONTEXT
Spring Boot 3.x, Spring Security 6, Java 17+.
Use the existing User entity, Role enum, JWT authentication, and security configuration.

TASK
Restrict course-management endpoints to users with the ADMIN role.
Allow authorized users to access only the endpoints permitted by the lab requirements.
Return the expected JSON 403 response when an authenticated user lacks the required role.
Do not break signup, login, or existing authentication behavior.

ALLOWED TO CREATE OR CHANGE
Only the security configuration and controller/service files required for role-based access control.

RULES
Use the existing Role enum and exception-handling components.
Do not duplicate authentication logic.
Do not return entities directly from controllers.
Do not modify unrelated files.
If something is unclear, add a TODO comment instead of guessing.

OUTPUT
Each changed file in full, with its path. Then a list of anything assumed.
```

---

## Slice 5 — Logout (stretch, S5)

**Prompt **

```text
CONTEXT
Spring Boot 3.x, Spring Security 6, Java 17+.
Use the existing JWT authentication filter, JWT service, and security configuration.

TASK
Implement POST /api/auth/logout.
Invalidate the presented JWT using the project's token-denylist mechanism, if available.
Ensure a logged-out token cannot be used for subsequent authenticated requests.
Return the response status and body required by the lab specification.
Do not break login or other authenticated endpoints.

ALLOWED TO CREATE OR CHANGE
Only the logout endpoint and the security/JWT files required to support token invalidation.

RULES
Reuse existing components and exceptions where possible.
Do not store plaintext passwords or expose JWT secrets.
Do not modify unrelated files.
If something is unclear, add a TODO comment instead of guessing.

OUTPUT
Each changed file in full, with its path. Then a list of anything assumed.
```