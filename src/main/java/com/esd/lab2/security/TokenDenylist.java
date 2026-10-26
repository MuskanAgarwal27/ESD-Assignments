package com.esd.lab2.security;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TokenDenylist {

    private final ConcurrentHashMap<String, Instant> revokedTokens =
            new ConcurrentHashMap<>();

    public void revoke(String jti, Instant expiry) {
        revokedTokens.put(jti, expiry);
    }

    public boolean isRevoked(String jti) {
        Instant expiry = revokedTokens.get(jti);

        if (expiry == null) {
            return false;
        }

        if (!expiry.isAfter(Instant.now())) {
            revokedTokens.remove(jti, expiry);
            return false;
        }

        return true;
    }

    public void cleanExpired() {
        Instant now = Instant.now();
        revokedTokens.entrySet().removeIf(
                entry -> !entry.getValue().isAfter(now)
        );
    }
}
