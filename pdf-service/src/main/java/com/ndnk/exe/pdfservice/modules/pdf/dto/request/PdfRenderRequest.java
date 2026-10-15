package com.ndnk.exe.pdfservice.modules.pdf.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PdfRenderRequest(
        @NotBlank @Size(max = 2_000_000) String html,
        @Size(max = 120) @Pattern(regexp = "[\\p{L}\\p{N}._ -]*") String filename,
        @Valid PdfRenderOptions options
) {}
