package fpt.su26.exe101.backend.modules.cv.service;

import fpt.su26.exe101.backend.modules.cv.dto.PdfRenderOptions;

public interface PdfRenderService {
    byte[] render(String html, String filename, PdfRenderOptions options);
}
