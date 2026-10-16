package fpt.su26.exe101.backend.modules.cv.client;

import fpt.su26.exe101.backend.modules.cv.dto.PdfRenderRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/** Declarative HTTP contract for the separately deployed PDF service. */
@FeignClient(name = "pdf-service", url = "${external.services.pdf.url}")
public interface PdfServiceClient {
    @PostMapping(
            value = "/api/v1/pdf",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_PDF_VALUE)
    byte[] render(@RequestBody PdfRenderRequest request);
}
