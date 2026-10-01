package fpt.su26.exe101.backend.modules.auth.event;

import java.util.UUID;

/**
 * Event published when a new account is successfully created.
 */
public record AccountCreatedEvent(UUID accountId) {
}
