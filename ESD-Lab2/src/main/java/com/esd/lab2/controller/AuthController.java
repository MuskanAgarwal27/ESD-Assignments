package com.esd.lab2.controller;

import com.esd.lab2.dto.LoginRequest;
import com.esd.lab2.dto.LoginResponse;
import com.esd.lab2.dto.SignupRequest;
import com.esd.lab2.dto.UserResponse;
import com.esd.lab2.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.esd.lab2.security.JwtService;
import com.esd.lab2.security.TokenDenylist;
import io.jsonwebtoken.Claims;
import java.time.Instant;
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final JwtService jwtService;
    private final TokenDenylist tokenDenylist;
    private final AuthService authService;

    public AuthController(
            AuthService authService,
            JwtService jwtService,
            TokenDenylist tokenDenylist) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.tokenDenylist = tokenDenylist;
    }

    @PostMapping("/signup")
    public ResponseEntity<UserResponse> signup(
            @Valid @RequestBody SignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
public ResponseEntity<Void> logout(
        @RequestHeader(value = "Authorization", required = false) String header) {

    if (header == null || !header.startsWith("Bearer ")) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    try {
        String token = header.substring(7);
        Claims claims = jwtService.parseToken(token);

        String jti = claims.getId();
        Instant expiry = claims.getExpiration().toInstant();

        if (jti == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        tokenDenylist.revoke(jti, expiry);
        return ResponseEntity.noContent().build();

    } catch (io.jsonwebtoken.JwtException | IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}
}
