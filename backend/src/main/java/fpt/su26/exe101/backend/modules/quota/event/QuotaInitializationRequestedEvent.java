package fpt.su26.exe101.backend.modules.quota.event;

import java.util.UUID;

/** Published when an existing account is found without its quota row. */
public record QuotaInitializationRequestedEvent(UUID accountId) {
}
