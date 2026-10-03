package fpt.su26.exe101.backend.modules.gallery.listener;

import fpt.su26.exe101.backend.modules.auth.event.AccountCreatedEvent;
import fpt.su26.exe101.backend.modules.gallery.service.GalleryService;
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
        try {
            galleryService.createGalleryForAccount(event.accountId());
        } catch (Exception e) {
            log.error("[GALLERY] Account setup failed | accountId={} | errorType={}",
                    event.accountId(), e.getClass().getSimpleName(), e);
        }
    }
}
