package fpt.su26.exe101.backend.modules.cv.dto;

/** JSON contract for POST /api/v1/pdf on the standalone PDF service. */
public record PdfRenderRequest(String html, String filename, PdfRenderOptions options) {
}
