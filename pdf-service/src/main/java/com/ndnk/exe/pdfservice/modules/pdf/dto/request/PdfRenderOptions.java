package com.ndnk.exe.pdfservice.modules.pdf.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PdfRenderOptions(
        @Pattern(regexp = "A[0-6]|Letter|Legal|Tabloid|Ledger") String format,
        Boolean landscape,
        Boolean printBackground,
        Boolean preferCssPageSize,
        @Size(max = 20) @Pattern(regexp = "(?:0|[0-9]+(?:\\.[0-9]+)?(?:px|in|cm|mm))") String marginTop,
        @Size(max = 20) @Pattern(regexp = "(?:0|[0-9]+(?:\\.[0-9]+)?(?:px|in|cm|mm))") String marginRight,
        @Size(max = 20) @Pattern(regexp = "(?:0|[0-9]+(?:\\.[0-9]+)?(?:px|in|cm|mm))") String marginBottom,
        @Size(max = 20) @Pattern(regexp = "(?:0|[0-9]+(?:\\.[0-9]+)?(?:px|in|cm|mm))") String marginLeft
) {}
