
package com.esd.lab2.service;
import java.util.Locale;
import com.esd.lab2.dto.SignupRequest;
import com.esd.lab2.dto.UserResponse;
import com.esd.lab2.entity.Role;
import com.esd.lab2.entity.User;
import com.esd.lab2.exception.DuplicateResourceException;
import com.esd.lab2.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * S1 — FILL IN MANUALLY (no AI for this slice).
 *
 * Steps to implement signup():
 *   1. Normalise the email: trim it and convert to lowercase.
 *   2. Check if the email already exists using userRepository.existsByEmail(...).
 *      If it does, throw DuplicateResourceException with a helpful message.
 *   3. Hash the password using passwordEncoder.encode(...).
 *      Never store plaintext. Never use new BCryptPasswordEncoder() — use the injected bean.
 *   4. Create a new User entity. Role must always be STUDENT — do not read role from the request.
 *   5. Save the user with userRepository.save(...).
 *   6. Return a UserResponse built from the saved entity.
 *
 * S2 onwards: login() and other methods will be added here by AI.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Registers a new user. Role is always STUDENT regardless of what the request contains.
     */
    public UserResponse signup(SignupRequest request) {
        // TODO 1: normalise the email (trim + lowercase)
        String email = request.email().trim().toLowerCase(Locale.ROOT);

        // TODO 2: check for duplicate email and throw DuplicateResourceException if found
	if (userRepository.existsByEmail(email)) {
	        throw new DuplicateResourceException("Email already exists");
    	}
        // TODO 3: hash the password using the injected passwordEncoder bean
        String hashedPassword = passwordEncoder.encode(request.password());

        // TODO 4: build and save the User entity (role = Role.STUDENT always)
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(hashedPassword);
	user.setFullName(request.fullName());
        user.setRole(Role.STUDENT);
        user = userRepository.save(user);

        // TODO 5: return a UserResponse — never return the User entity directly
        return toResponse(user);
    }

    // ── helper ────────────────────────────────────────────────────────────────

    private UserResponse toResponse(User user) {
   	 return new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole(),
            user.getCreatedAt()
    );
}
}
