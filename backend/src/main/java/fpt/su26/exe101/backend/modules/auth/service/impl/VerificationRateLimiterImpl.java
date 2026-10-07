package fpt.su26.exe101.backend.modules.auth.service.impl;

import fpt.su26.exe101.backend.base.exception.*;
import fpt.su26.exe101.backend.modules.auth.exception.VerificationRateLimitException;
import fpt.su26.exe101.backend.modules.auth.service.VerificationRateLimiter;
import org.springframework.stereotype.Component;
import java.time.Instant;
import java.util.*;

/** Single-instance limiter. Apply for all addresses, including nonexistent accounts. */
@Component
public class VerificationRateLimiterImpl implements VerificationRateLimiter {
    private final Map<String, Deque<Instant>> buckets = new HashMap<>();

    public synchronized void check(String email, String ip) {
        Instant now = Instant.now();
        buckets.values().forEach(q -> q.removeIf(t -> t.isBefore(now.minusSeconds(3600))));
        buckets.entrySet().removeIf(e -> e.getValue().isEmpty());
        if (buckets.size() > 20000) reject(60);
        Deque<Instant> emailQueue = buckets.computeIfAbsent("email:" + email, ignored -> new ArrayDeque<>());
        Deque<Instant> ipQueue = buckets.computeIfAbsent("ip:" + ip, ignored -> new ArrayDeque<>());
        long retrySeconds = 0;
        if (emailQueue.size() >= 5) retrySeconds = secondsUntil(emailQueue.getFirst().plusSeconds(3600), now);
        if (ipQueue.size() >= 20) retrySeconds = Math.max(retrySeconds, secondsUntil(ipQueue.getFirst().plusSeconds(3600), now));
        if (!emailQueue.isEmpty()) retrySeconds = Math.max(retrySeconds, secondsUntil(emailQueue.getLast().plusSeconds(60), now));
        if (retrySeconds > 0) reject(retrySeconds);
        emailQueue.addLast(now);
        ipQueue.addLast(now);
    }

    private long secondsUntil(Instant until, Instant now) {
        return Math.max(0, (java.time.Duration.between(now, until).toMillis() + 999) / 1000);
    }

    private void reject(long retrySeconds) {
        throw new VerificationRateLimitException(retrySeconds);
    }
}
