package fpt.su26.exe101.backend.modules.cv.controller;

import fpt.su26.exe101.backend.modules.cv.dto.PdfRenderRequest;
import fpt.su26.exe101.backend.modules.cv.service.PdfRenderService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;

/** Backend entry point that proxies CV PDF rendering to the dedicated PDF service. */
@RestController
@RequestMapping("/api/cv/pdf")
public class PdfRenderController {
    private final PdfRenderService pdfRenderService;

    public PdfRenderController(PdfRenderService pdfRenderService) {
        this.pdfRenderService = pdfRenderService;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> render(@RequestBody PdfRenderRequest request) {
        byte[] pdf = pdfRenderService.render(request.html(), request.filename(), request.options());
        String filename = normalizeFilename(request.filename());

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(filename, StandardCharsets.UTF_8)
                        .build()
                        .toString())
                .body(pdf);
    }

    private String normalizeFilename(String filename) {
        String normalized = filename == null || filename.isBlank() ? "CV.pdf" : filename.trim();
        return normalized.toLowerCase().endsWith(".pdf") ? normalized : normalized + ".pdf";
    }
}
