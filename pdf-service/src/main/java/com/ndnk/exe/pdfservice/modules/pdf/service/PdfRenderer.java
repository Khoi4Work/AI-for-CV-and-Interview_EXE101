package com.ndnk.exe.pdfservice.modules.pdf.service;

import com.ndnk.exe.pdfservice.modules.pdf.dto.request.PdfRenderOptions;

public interface PdfRenderer {
    byte[] render(String html, PdfRenderOptions options);
}
