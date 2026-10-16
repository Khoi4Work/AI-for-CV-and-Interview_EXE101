package com.ndnk.exe.pdfservice.modules.pdf.service.impl;

import com.ndnk.exe.pdfservice.modules.pdf.dto.request.PdfRenderRequest;
import com.ndnk.exe.pdfservice.modules.pdf.dto.response.PdfRenderResponse;
import com.ndnk.exe.pdfservice.modules.pdf.dto.request.PdfRenderOptions;
import com.ndnk.exe.pdfservice.modules.pdf.service.PdfRenderer;
import com.ndnk.exe.pdfservice.modules.pdf.service.PdfService;
import org.springframework.stereotype.Service;

@Service
public class PdfServiceImpl implements PdfService {
    private final PdfRenderer pdfRenderer;

    public PdfServiceImpl(PdfRenderer pdfRenderer) {
        this.pdfRenderer = pdfRenderer;
    }

    @Override
    public PdfRenderResponse render(PdfRenderRequest request) {
        return new PdfRenderResponse(normalizeFilename(request.filename()),
                pdfRenderer.render(request.html(), request.options()));
    }

    private String normalizeFilename(String filename) {
        String normalized = filename == null || filename.isBlank() ? "document.pdf" : filename;
        return normalized.toLowerCase().endsWith(".pdf") ? normalized : normalized + ".pdf";
    }
}
