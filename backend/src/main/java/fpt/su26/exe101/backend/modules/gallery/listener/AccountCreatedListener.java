package fpt.su26.exe101.backend.modules.gallery.listener;

import fpt.su26.exe101.backend.modules.auth.event.AccountCreatedEvent;
import fpt.su26.exe101.backend.modules.gallery.service.GalleryService;
import fpt.su26.exe101.backend.modules.gallery.service.impl.GalleryServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class AccountCreatedListener {
    private final GalleryService galleryService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleAccountCreatedEvent(AccountCreatedEvent event) {
        log.info("Received AccountCreatedEvent for accountId: {}. Triggering gallery creation.", event.accountId());
        try {
            galleryService.createGalleryForAccount(event.accountId());
        } catch (Exception e) {
            log.error("Failed to create gallery for account: {}. Error: {}", event.accountId(), e.getMessage());
        }
    }
}
