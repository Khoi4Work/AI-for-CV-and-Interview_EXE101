package fpt.su26.exe101.backend.modules.cv.dto;

/** Optional Chromium print settings supported by the PDF service. */
public record PdfRenderOptions(
        String format,
        Boolean landscape,
        Boolean printBackground,
        Boolean preferCssPageSize,
        String marginTop,
        String marginRight,
        String marginBottom,
        String marginLeft
) {
}
