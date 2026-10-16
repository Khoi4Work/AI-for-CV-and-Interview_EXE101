package com.ndnk.exe.pdfservice.modules.pdf.controller;

import com.ndnk.exe.pdfservice.modules.pdf.dto.request.PdfRenderRequest;
import com.ndnk.exe.pdfservice.modules.pdf.dto.response.PdfRenderResponse;
import com.ndnk.exe.pdfservice.modules.pdf.service.PdfService;
import jakarta.validation.Valid;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/v1")
public class PdfController {
    private final PdfService pdfService;

    public PdfController(PdfService pdfService) {
        this.pdfService = pdfService;
    }

    @PostMapping(value = "/pdf", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> render(@Valid @RequestBody PdfRenderRequest request) {
        PdfRenderResponse response = pdfService.render(request);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(response.filename(), StandardCharsets.UTF_8).build().toString())
                .body(response.content());
    }
}
