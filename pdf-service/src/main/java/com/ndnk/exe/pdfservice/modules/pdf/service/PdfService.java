package com.ndnk.exe.pdfservice.modules.pdf.service;

import com.ndnk.exe.pdfservice.modules.pdf.dto.request.PdfRenderRequest;
import com.ndnk.exe.pdfservice.modules.pdf.dto.response.PdfRenderResponse;

public interface PdfService {
    PdfRenderResponse render(PdfRenderRequest request);
}
